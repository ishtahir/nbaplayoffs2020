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
}

getScores('westseries1');
