const puppeteer = require('puppeteer');
const axios = require('axios');
const { get } = require('mongoose');

const baseUrl = 'http://localhost:4501';

function getScores(link) {
  checkToUpdate(link.split('series').join('/')).then(async (series) => {
    if (series.seriesOver) {
      console.log(`${series.seriesName} is over and up to date.`);
      return;
    } else {
      console.log('\n', 'getting the data...');
      const browser = await puppeteer.launch();

      const page = await browser.newPage();

      page.setDefaultNavigationTimeout(0);

      await page.setViewport({ width: 1366, height: 768 });

      await page.goto(`https://www.nba.com/playoffs/2020/${link}`);

      try {
        var scoreData = await page.$eval('table > tbody', (items) =>
          [...items.children]
            .map((game) => {
              const props = {};
              if (
                game.cells.length &&
                game.cells[1].textContent !==
                  String.fromCharCode(game.cells[1].textContent.charCodeAt(0))
              ) {
                props.game = game.cells[1].textContent;
                if (game.cells[2].children.length) {
                  props.score = game.cells[2].children[0].textContent;
                }
                if (game.cells[3].textContent.length) {
                  props.channel = game.cells[3].textContent;
                }
                if (game.cells[4].children.length) {
                  props.date = game.cells[4].children[0].textContent;
                }
              }

              return props;
            })
            .filter((game) => Object.keys(game).length > 0)
        );
      } catch (err) {
        console.log("There was an error on NBA's side.");
        console.log(err);
        getScores(link);
      }

      await browser.close();

      editData(scoreData);
    }
  });
}

function editData(scores) {
  console.log('\n', 'editing scores...');
  const newArr = [...scores];

  for (let i = 0; i < newArr.length; i++) {
    newArr[i].game = `game${newArr[i].game.split('')[1]}`;
    newArr[i].score.includes('at')
      ? (newArr[i].completed = false)
      : (newArr[i].completed = true);
  }

  for (let i = 0; i < newArr.length; i++) {
    if (newArr[i].completed) {
      let oldScore = newArr[i].score;
      let newScore = {};
      newScore.awayTeam = oldScore.split('-')[0].split(' ')[0];
      newScore.awayScore = parseInt(oldScore.split('-')[0].split(' ')[1]);
      newScore.homeTeam = oldScore.split('-')[1].split(' ')[2];
      newScore.homeScore = parseInt(oldScore.split('-')[1].split(' ')[1]);
      newArr[i].score = newScore;
      delete newArr[i].channel;
      delete newArr[i].date;
    }
  }

  formattingData(newArr);
}

async function formattingData(scoresArr) {
  console.log('\n', 'formatting data to our liking...');

  let seriesName;
  if (typeof scoresArr[0].score === 'string') {
    const seriesSplit = scoresArr[0].score.split(' at ');
    seriesName = `${seriesSplit[1]}${seriesSplit[0]}`.toLowerCase();
  } else {
    seriesName = `${scoresArr[0].score.homeTeam}${scoresArr[0].score.awayTeam}`.toLowerCase();
  }

  const games = [];
  for (let i = 0; i < scoresArr.length; i++) {
    const game = {};
    const current = scoresArr[i];
    game.game = current.game;
    if (current.completed) {
      game.homeTeam = current.score.homeTeam;
      game.homeScore = current.score.homeScore;
      game.awayTeam = current.score.awayTeam;
      game.awayScore = current.score.awayScore;
    } else {
      game.location = current.score;
      game.channel = current.channel;
      game.date = current.date;
      game.parsed = parseDate(current.date);
    }
    game.completed = current.completed;
    games.push(game);
  }

  updateDatabase(seriesName, { games });

  const seriesData = await axios.get(`${baseUrl}/series/${seriesName}`);
  const series = seriesData.data;

  calculateWins(series);

  updateDatabase(seriesName, {
    highSeed: series.highSeed,
    lowSeed: series.lowSeed,
    seriesOver: series.seriesOver,
  });
}

function calculateWins(matchup) {
  console.log('\n', 'calculating each teams wins...');

  matchup.highSeed.wins = 0;
  matchup.lowSeed.wins = 0;

  matchup.games.forEach((game, i) => {
    if (game.completed) {
      const { homeScore, awayScore } = game;
      if (i === 0 || i === 1 || i === 4 || i === 6) {
        homeScore > awayScore
          ? matchup.highSeed.wins++
          : matchup.lowSeed.wins++;
      } else {
        homeScore > awayScore
          ? matchup.lowSeed.wins++
          : matchup.highSeed.wins++;
      }
    }
  });

  if (matchup.highSeed.wins === 4) {
    matchup.lowSeed.eliminated = true;
    updateSettings(matchup.lowSeed.short);
    matchup.seriesOver = true;
  } else if (matchup.lowSeed.wins === 4) {
    matchup.highSeed.eliminated = true;
    updateSettings(matchup.highSeed.short);
    matchup.seriesOver = true;
  }

  console.log('\n', `${matchup.seriesName} COMPLETED!`, '\n');
}

async function getAllScores() {
  const allSeriesData = await axios.get(`${baseUrl}/series`);
  const allSeries = allSeriesData.data;
  for (const series of allSeries) {
    getScores(series.link);
  }
}

async function updateSettings(short) {
  try {
    await axios.patch(`${baseUrl}/settings/${short}`);
  } catch (err) {
    console.log(err);
  }
}

function updateDatabase(seriesName, series, newPost = false) {
  if (!newPost) {
    axios
      .patch(`${baseUrl}/series/${seriesName}`, series)
      .then((_) => console.log(`Success! Updated ${seriesName}!`))
      .catch((_) => console.log(`There was an error updating ${seriesName}!`));
  } else {
    axios
      .post(`${baseUrl}/series/${seriesName}`, series)
      .then((_) => console.log(`Success! Created new series: ${seriesName}!`))
      .catch((_) =>
        console.log(`There was an error creating series ${seriesName}!`)
      );
  }
}

async function checkToUpdate(seriesLink) {
  try {
    const result = await axios.get(`${baseUrl}/series/${seriesLink}`);
    return result.data;
  } catch (err) {
    console.log(err);
  }
}

async function findNextGameToUpdate() {
  const allSeriesData = await axios.get(`${baseUrl}/series/current/active`);
  const activeSeries = allSeriesData.data;
  // console.log('\n\n', 'activeSeries', activeSeries, '\n\n');
  const nextUp = [];
  activeSeries.forEach((series) => {
    for (const game of series.games) {
      if (!game.completed) {
        nextUp.push({
          link: series.link,
          series: series.seriesName,
          game: game.game,
          parsed: game.parsed,
        });
        break;
      }
    }
  });
  nextUp.sort((a, b) => a.parsed - b.parsed);
  // console.log('\n\n', 'nextUp', nextUp, '\n\n');
  updateScoresWithTimer(nextUp[0]);
}

function updateScoresWithTimer(currentGame) {
  setTimeout(() => {
    let intervalID = setInterval(async () => {
      getScores(currentGame.link);
      const series = await axios.get(`${baseUrl}/series/${currentGame.series}`);
      const theGame = series.data.games.filter(
        (game) => game.game === currentGame.game
      );
      if (theGame[0].completed) {
        clearInterval(intervalID);
      }
    }, 200000);
  }, currentGame.parsed + hoursToMs(2.5) - Date.now());
}

function parseDate(date) {
  const split = date.split(' ');
  if (split[split.length - 1] === '') {
    split.pop();
  }
  const trimmed = split.map((val) => val.trim());

  let dateStr = '';

  dateStr += `${trimmed[0]}/20`;
  dateStr += ' ';

  if (trimmed[1] !== 'TBD') {
    const timeSplit = trimmed[1].split(':');
    const hour = parseInt(timeSplit[0]) + 11;
    dateStr += `${hour}:${timeSplit[1]}:00`;
  }

  return Date.parse(dateStr);
}

function hoursToMs(hours) {
  return hours * 60 * 60 * 1000;
}

async function determineMatchup(round) {
  const settings = await axios.get(`${baseUrl}/settings`);
  const { westTeams, eastTeams, seedingOrder } = settings.data;
  const allSeriesData = await axios.get(`${baseUrl}/series`);
  const allSeries = allSeriesData.data;

  const teams = [...westTeams, ...eastTeams].filter((team) =>
    checkTeamEligibility(team, allSeries)
  );
  if (teams.length % 2 !== 0) {
    console.log(
      "Waiting for other series to finish. Can't make a series with one team."
    );
    return;
  }
  const matchups = [];
  let seeding, isFinals;
  if (round === 1) {
    seeding = 'first';
  } else if (round === 2) {
    seeding = 'second';
  } else if (round === 3) {
    seeding = 'third';
  }

  isFinals = round === 4;

  while (teams.length) {
    const currentTeam = teams[0];

    const nextUp = teams.filter((team) => {
      if (isFinals) {
        return !team.eliminated && team.conf !== currentTeam.conf;
      } else {
        return (
          team.conf === currentTeam.conf &&
          seedingOrder[currentTeam.seed][seeding].includes(team.seed)
        );
      }
    })[0];

    let highTeam, lowTeam;
    if (currentTeam.seed < nextUp.seed) {
      highTeam = currentTeam;
      lowTeam = nextUp;
    } else {
      lowTeam = currentTeam;
      highTeam = nextUp;
    }

    matchups.push([highTeam, lowTeam, round, isFinals]);

    const index = teams.indexOf(nextUp);

    teams.splice(index, 1);
    teams.shift();
  }
  matchups.forEach((match) => createPlayoffMatchup(...match));
}

function createPlayoffMatchup(highTeam, lowTeam, round, finals) {
  if (round === 1) {
    linkStartWest = 1;
    linkStartEast = 1;
  } else if (round === 2) {
    linkStartWest = 5;
    linkStartEast = 5;
  } else if (round === 3) {
    linkStartWest = 7;
    linkStartEast = 7;
  } else {
    linkStart = 8;
  }

  const conf = finals ? 'finals' : highTeam.conf;
  const series = {};

  series.seriesName = `${highTeam.short}${lowTeam.short}`.toLowerCase();

  if (finals) {
    linkText = `${conf}series${linkStart}`;
  } else {
    if (conf === 'west') {
      linkText = `${conf}series${linkStartWest++}`;
    } else {
      linkText = `${conf}series${linkStartEast++}`;
    }
  }
  series.link = linkText;

  series.highSeed = highTeam;
  series.highSeed.wins = 0;

  series.lowSeed = lowTeam;
  series.lowSeed.wins = 0;

  series.games = [];

  series.seriesOver = false;
  series.round = round;

  for (let i = 1; i < 8; i++) {
    series.games.push({ game: `game${i}` });
  }

  updateDatabase(series.seriesName, series, true);
  return series;
}

function checkTeamEligibility(team, allSeries) {
  const teamSeries = allSeries.filter((series) =>
    series.seriesName.includes(team.short.toLowerCase())
  );
  return !team.eliminated && teamSeries.every((series) => series.seriesOver);
}

// findNextGameToUpdate();
determineMatchup(4);
