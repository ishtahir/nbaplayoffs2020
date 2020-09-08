const puppeteer = require('puppeteer');
const fs = require('fs');

const path = 'server/files';

async function getScores(link) {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

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
    console.log('There was an Error:');
    console.log(err);
    getScores(link);
  }

  fs.writeFileSync(`${path}/${link}.json`, JSON.stringify(data, null, 2));

  browser.close();

  editFile(`${link}.json`);
}

function editFile(file) {
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

  updateMainFile(
    `${path}/${file}`,
    `${path}/${file.split('series').join('round')}`
  );
}

function updateMainFile(oldFile, playoffsFile) {
  const oldFileData = JSON.parse(fs.readFileSync(oldFile, 'utf8'));
  const playoffsData = JSON.parse(fs.readFileSync(playoffsFile, 'utf8'));

  let seriesLink;
  for (let i = 0; i < oldFileData.length; i++) {
    const homeTeam = oldFileData[i].score.homeTeam;
    const series = playoffsData.find(
      (series) =>
        series.highSeed.short === homeTeam || series.lowSeed.short === homeTeam
    );
    if (
      oldFileData[i].completed &&
      series.hasOwnProperty(oldFileData[i].game)
    ) {
      series[oldFileData[i].game].homeTeam = oldFileData[i].score.homeTeam;
      series[oldFileData[i].game].homeScore = oldFileData[i].score.homeScore;
      series[oldFileData[i].game].awayTeam = oldFileData[i].score.awayTeam;
      series[oldFileData[i].game].awayScore = oldFileData[i].score.awayScore;
      series[oldFileData[i].game].completed = oldFileData[i].completed;
    }
    seriesLink = series.link;
  }

  fs.writeFileSync(playoffsFile, JSON.stringify(playoffsData, null, 2));

  calculateWins(seriesLink, playoffsFile);
}

function calculateWins(series, playoffsFile) {
  const playoffs = JSON.parse(fs.readFileSync(playoffsFile, 'utf8'));
  const matchup = playoffs.find((match) => match.link === series);

  matchup.highSeed.wins = 0;
  matchup.lowSeed.wins = 0;
  for (let i = 1; i < 8; i++) {
    const current = matchup[`game${i}`];
    if (current.hasOwnProperty('completed') && current.completed) {
      const { homeScore, awayScore } = current;
      if (i === 1 || i === 2 || i === 5 || i === 7) {
        homeScore > awayScore
          ? matchup.highSeed.wins++
          : matchup.lowSeed.wins++;
      } else {
        homeScore > awayScore
          ? matchup.lowSeed.wins++
          : matchup.highSeed.wins++;
      }
    }
  }

  fs.writeFileSync(playoffsFile, JSON.stringify(playoffs, null, 2));
}

async function getAllScores(conf, round) {
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
  const link = `${conf}series`;
  for (let i = start; i <= end; i++) {
    await getScores(`${link}${i}`);
  }
}

module.exports = {
  getAllScores,
};
