const fs = require('fs');
const axios = require('axios');

const path = 'server/files';
const playoffFile = `${path}/playoffs-all-series-2020.json`;
const baseUrl = 'http://localhost:4501';

// const [westTeams, eastTeams, seedingOrder, last] = JSON.parse(
//   fs.readFileSync(`${path}/settings.json`, 'utf8')
// );

async function determineMatchup(round) {
  const settings = await axios.get(`${baseUrl}/settings`);
  const { westTeams, eastTeams, seedingOrder, last } = settings.data;
  const allSeriesData = await axios.get(`${baseUrl}/series`);
  const allSeries = allSeriesData.data;
  // const allSeries = JSON.parse(fs.readFileSync(playoffFile));
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
  let seeding, lastConf, isFinals;
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

    const nextUp = teams.filter(
      (team) =>
        team.conf === currentTeam.conf &&
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

    matchups.push([highTeam, lowTeam, round, isFinals]);

    const index = teams.indexOf(nextUp);

    teams.splice(index, 1);
    teams.shift();
  }
  // console.log(matchups);
  matchups.forEach((match) => createPlayoffMatchup(...match));
}

determineMatchup(3);

function createPlayoffMatchup(highTeam, lowTeam, round, finals = false) {
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

  // console.log(series);
  postToDatabase(series);
  return series;
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

function checkTeamEligibility(team, allSeries) {
  const teamSeries = allSeries.filter((series) =>
    series.seriesName.includes(team.short.toLowerCase())
  );
  return !team.eliminated && teamSeries.every((series) => series.seriesOver);
}

function postToDatabase(series) {
  axios
    .post(`${baseUrl}/series/${series.seriesName}`, series)
    .then((result) => console.log(result.message))
    .catch((err) => console.log(err));
}

module.exports = {
  updateSettings,
};
