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
    var data = await page.$eval(
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

  fs.writeFileSync(`${path}/${link}.json`, JSON.stringify(data, null, 2));

  browser.close();

  editFile(`${link}.json`);
}

function editFile(file) {
  console.log('\n', 'editing scores...');
  const readData = JSON.parse(fs.readFileSync(`${path}/${file}`, 'utf8'));
  const newArr = [...readData];

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
  fs.writeFileSync(`${path}/${file}`, JSON.stringify(newArr, null, 2));

  updateMainFile(`${path}/${file}`, `${path}/playoffs-all-series-2020.json`);
}

function updateMainFile(oldFile, playoffsFile) {
  console.log('\n', 'editing main playoffs file...');
  const oldFileData = JSON.parse(fs.readFileSync(oldFile, 'utf8'));
  const playoffsData = JSON.parse(fs.readFileSync(playoffsFile, 'utf8'));

  const seriesLink = `${oldFileData[0].score.homeTeam}${oldFileData[0].score.awayTeam}`.toLowerCase();
  for (let i = 0; i < oldFileData.length; i++) {
    const series = playoffsData.find(
      (series) => series.seriesName === seriesLink
    );
    if (oldFileData[i].completed) {
      series.games.forEach((game) => {
        if (game.game === oldFileData[i].game) {
          game.homeTeam = oldFileData[i].score.homeTeam;
          game.homeScore = oldFileData[i].score.homeScore;
          game.awayTeam = oldFileData[i].score.awayTeam;
          game.awayScore = oldFileData[i].score.awayScore;
          game.completed = oldFileData[i].completed;
        }
      });
    }
  }

  cleanup(oldFile);

  fs.writeFileSync(playoffsFile, JSON.stringify(playoffsData, null, 2));

  calculateWins(seriesLink, playoffsFile);
}

function calculateWins(series, playoffsFile) {
  console.log('\n', 'calculating each teams wins...');
  const playoffs = JSON.parse(fs.readFileSync(playoffsFile, 'utf8'));
  const matchup = playoffs.find((match) => match.seriesName === series);

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

  fs.writeFileSync(playoffsFile, JSON.stringify(playoffs, null, 2));

  console.log('\n', `${series} COMPLETED!`, '\n');
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
getScores('westseries6');
