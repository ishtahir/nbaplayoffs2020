const puppeteer = require('puppeteer');
const axios = require('axios');

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

async function getAllScores(round) {
  for (const series of playoffsData) {
    if (series.round === round && !series.seriesOver) {
      await getScores(series.link);
    }
  }
}

async function updateSettings(short) {
  try {
    await axios.patch(`${baseUrl}/settings/${short}`);
  } catch (err) {
    console.log(err);
  }
}

function updateDatabase(seriesName, obj) {
  axios
    .patch(`${baseUrl}/series/${seriesName}`, obj)
    .then((_) => console.log(`Success! Updated ${seriesName}!`))
    .catch((_) => console.log(`There was an error updating ${seriesName}!`));
}

async function checkToUpdate(seriesLink) {
  try {
    const result = await axios.get(`${baseUrl}/series/${seriesLink}`);
    return result.data;
  } catch (err) {
    console.log(err);
  }
}

getScores('eastseries7');
