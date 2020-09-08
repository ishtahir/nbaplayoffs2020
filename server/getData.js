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

getScores('westseries1');

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
  }

  fs.writeFileSync(playoffsFile, JSON.stringify(playoffsData, null, 2));
}
