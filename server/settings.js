const fs = require('fs');

const path = 'server/files';

const [westTeams, eastTeams, seedingOrder] = JSON.parse(
  fs.readFileSync(`${path}/settings.json`, 'utf8')
);

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function createPlayoffMatchup(conf, round) {
  const teams = conf === 'west' ? westTeams : eastTeams;
  const matchups = [];
  let seeding;
  let matches;
  if (round === 1) {
    seeding = 'first';
    matches = 4;
  } else if (round === 2) {
    seeding = 'second';
    matches = 2;
  } else if (round === 3) {
    seeding = 'third';
    matches = 1;
  }

  for (let i = 0; i < matches; i++) {
    const series = {};
    if (teams[i].eliminated) {
      continue;
    }
    const nextUp = teams.filter((team) =>
      seedingOrder[teams[i].seed][seeding].includes(team.seed)
    )[0];

    let highTeam;
    let lowTeam;
    if (teams[i].seed < nextUp.seed) {
      highTeam = teams[i];
      lowTeam = nextUp;
    } else {
      lowTeam = teams[i];
      highTeam = nextUp;
    }
    series.seriesName = `${highTeam.short}${lowTeam.short}`.toLowerCase();
    series.conf = conf;
    series.link = `${conf}series${highTeam.seed}`;

    series.highSeed = highTeam;
    series.highSeed.wins = 0;

    series.lowSeed = lowTeam;
    series.lowSeed.wins = 0;

    for (let i = 1; i < 8; i++) {
      series[`game${i}`] = {};
    }
    matchups.push(series);
  }

  writeFile(`${path}/${conf}round${round}.json`, matchups);
}

module.exports = {
  createPlayoffMatchup,
};
