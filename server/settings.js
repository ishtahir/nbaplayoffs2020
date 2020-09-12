const fs = require('fs');

const path = 'server/files';
const playoffFile = `${path}/playoffs-all-series-2020.json`;

const [westTeams, eastTeams, seedingOrder, last] = JSON.parse(
  fs.readFileSync(`${path}/settings.json`, 'utf8')
);

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function appendToFile(file, data) {
  const dataArr = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (Array.isArray(data)) {
    dataArr.push(...data);
  } else {
    dataArr.push(data);
  }
  writeFile(file, dataArr);
}

function isFileEmpty(file) {
  const fileData = fs.readFileSync(file, 'utf8');
  try {
    const fileDataArray = JSON.parse(fileData);
    return fileDataArray.length === 0 ? true : false;
  } catch (err) {
    console.log(
      'Error occured. The file should contain at least an empty array.'
    );
  }
}

function createPlayoffMatchup(round) {
  const teams = [...westTeams, ...eastTeams].filter(
    (team) => team.eliminated === false
  );
  const matchups = [];
  let seeding;
  let linkStartWest, linkStartEast, linkText;
  if (round === 1) {
    seeding = 'first';
    linkStartWest = 1;
    linkStartEast = 1;
  } else if (round === 2) {
    seeding = 'second';
    linkStartWest = 5;
    linkStartEast = 5;
  } else if (round === 3) {
    seeding = 'third';
    linkStartWest = 7;
    linkStartEast = 7;
  }

  while (teams.length) {
    const currentTeam = teams[0];
    const conf = currentTeam.conf;
    const series = {};
    if (currentTeam.eliminated) {
      continue;
    }
    const nextUp = teams.filter(
      (team) =>
        team.conf === currentTeam.conf &&
        team.eliminated === false &&
        seedingOrder[currentTeam.seed][seeding].includes(team.seed)
    )[0];

    let highTeam;
    let lowTeam;
    if (currentTeam.seed < nextUp.seed) {
      highTeam = currentTeam;
      lowTeam = nextUp;
    } else {
      lowTeam = currentTeam;
      highTeam = nextUp;
    }

    series.seriesName = `${highTeam.short}${lowTeam.short}`.toLowerCase();

    if (conf === 'west') {
      linkText = `${conf}series${linkStartWest++}`;
    } else {
      linkText = `${conf}series${linkStartEast++}`;
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

    matchups.push(series);

    const index = teams.indexOf(nextUp);

    teams.splice(index, 1);
    teams.shift();
  }

  if (isFileEmpty(playoffFile)) {
    writeFile(playoffFile, matchups);
  } else if (!isFileEmpty(playoffFile) && round > last.lastRoundPushed) {
    appendToFile(playoffFile, matchups);
  }
  updateSettings('last', round);
}

function updateSettings(teamData, conf) {
  const data = [];
  if (teamData === 'last') {
    last.lastRoundPushed = conf;
  } else {
    const teams = conf === 'west' ? westTeams : eastTeams;
    const team = teams.find((team) => team.short === teamData.short);
    team.eliminated = true;
  }

  data.push(westTeams, eastTeams, seedingOrder, last);

  writeFile(`${path}/settings.json`, data);
}

// createPlayoffMatchup(2);

module.exports = {
  updateSettings,
};
