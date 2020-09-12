const fs = require('fs');
const { match } = require('assert');

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
  const teams = [...westTeams, ...eastTeams].filter((team) =>
    checkTeamEligibility(team)
  );
  const matchups = [];
  let seeding, linkStartWest, linkStartEast, linkText, lastConf;
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

    const nextUp = teams.filter(
      (team) =>
        team.conf === currentTeam.conf &&
        team.eliminated === false &&
        seedingOrder[currentTeam.seed][seeding].includes(team.seed)
    )[0];

    let highTeam, lowTeam;
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

    lastConf = conf;

    const index = teams.indexOf(nextUp);

    teams.splice(index, 1);
    teams.shift();
  }

  if (isFileEmpty(playoffFile)) {
    writeFile(playoffFile, matchups);
  } else if (!isFileEmpty(playoffFile) && round > last.lastRoundPushed) {
    appendToFile(playoffFile, matchups);
  }
  updateSettings('last', { round, conf: lastConf });
}

function updateSettings(setting, options) {
  const data = [];
  if (setting === 'last') {
    last.lastRoundPushed = options.round;
    if (last.lastConferencePushed.length < 2 && options.conf) {
      last.lastConferencePushed.push(options.conf);
    }
  } else if (setting === 'teamElim') {
    const teams = options.team.conf === 'west' ? westTeams : eastTeams;
    const team = teams.find((team) => team.short === options.team.short);
    team.eliminated = true;
  }

  data.push(westTeams, eastTeams, seedingOrder, last);

  writeFile(`${path}/settings.json`, data);
}

function checkTeamEligibility(team) {
  const confTeams = team.conf === 'west' ? westTeams : eastTeams;
  const squad = confTeams.find((squad) => squad.mascot === team.mascot);

  const allSeriesOver = JSON.parse(fs.readFileSync(playoffFile))
    .filter((matches) => matches.seriesName.includes(team.short.toLowerCase()))
    .every((match) => match.seriesOver);

  return !squad.eliminated && allSeriesOver;
}

createPlayoffMatchup(3);

module.exports = {
  updateSettings,
};
