const puppeteer = require('puppeteer');
const fs = require('fs');
const { updateSettings } = require('./settings.js');

const path = 'server/files';

async function getScores(link) {
  console.log('\n', 'getting the data...');
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  await page.goto(`https://www.nba.com/playoffs/2020/${link}`);

  try {
    var scoreData = await page.$eval(
      '#gamedetails__matchup--series_tracker > div > div.small-12.medium-7.columns > div > table > tbody',
      (items) =>
        [...items.children].map((game) => {
          const props = {};
          props.game = game.cells[1].textContent;
          props.score = game.cells[2].children[0].textContent;
          props.channel = game.cells[3].textContent;
          props.date = game.cells[4].children[0].textContent;

          return props;
        })
    );
  } catch (err) {
    console.log("There was an error on NBA's side.");
    getScores(link);
  }

  browser.close();

  editData(scoreData);
}

function editData(data) {
  console.log('\n', 'editing scores...');
  const newArr = [...data];

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

  updateMainFile(`${path}/playoffs-all-series-2020.json`, newArr);
}

function updateMainFile(playoffsFile, scoresArr) {
  console.log('\n', 'editing main playoffs file...');
  const playoffsData = JSON.parse(fs.readFileSync(playoffsFile, 'utf8'));

  const seriesName = `${scoresArr[0].score.homeTeam}${scoresArr[0].score.awayTeam}`.toLowerCase();
  const series = playoffsData.find(
    (series) => series.seriesName === seriesName
  );
  for (let i = 0; i < scoresArr.length; i++) {
    if (scoresArr[i].completed) {
      series.games.forEach((game) => {
        if (game.game === scoresArr[i].game) {
          game.homeTeam = scoresArr[i].score.homeTeam;
          game.homeScore = scoresArr[i].score.homeScore;
          game.awayTeam = scoresArr[i].score.awayTeam;
          game.awayScore = scoresArr[i].score.awayScore;
          game.completed = scoresArr[i].completed;
        }
      });
    }
  }
  calculateWins(series);

  fs.writeFileSync(playoffsFile, JSON.stringify(playoffsData, null, 2));
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
    updateSettings(matchup.lowSeed, matchup.lowSeed.conf);
    matchup.seriesOver = true;
  } else if (matchup.lowSeed.wins === 4) {
    matchup.highSeed.eliminated = true;
    updateSettings(matchup.highSeed, matchup.highSeed.conf);
    matchup.seriesOver = true;
  }

  console.log('\n', `${matchup.seriesName} COMPLETED!`, '\n');
}

async function getAllScores(round) {
  const playoffsData = JSON.parse(
    fs.readFileSync(`${path}/playoffs-all-series-2020.json`)
  );
  let start, end;
  if (round === 1) {
    start = 1;
    end = 4;
  } else if (round === 2) {
    start = 5;
    end = 6;
  } else {
    start = 7;
    end = 7;
  }
  for (const series of playoffsData) {
    if (series.round === round && !series.seriesOver) {
      await getScores(series.link);
    }
  }
}

function cleanup(file) {
  try {
    fs.unlinkSync(file);
  } catch (err) {
    console.log('Error deleting file.');
  }
}

// getAllScores(2);
getScores('westseries5');
