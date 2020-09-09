const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { getAllScores } = require('./getData.js');
const { start } = require('./settings.js');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

app.get('/load/rd/:num', (req, res) => {
  const round = req.params.num;
  const playoffs = JSON.parse(
    fs.readFileSync(`server/files/playoffs-round${round}.json`, 'utf8')
  );
  res.send(playoffs);
});

app.get('/create/rd/:num', (req, res) => {
  const round = +req.params.num;
  start(round);
  res.redirect('/');
});

app.get('/scores/:conf/:num', async (req, res) => {
  const conf = req.params.conf;
  const round = +req.params.num;
  await getAllScores(conf, round);
  res.redirect(`/load/rd/${round}`);
});

// app.get('/scores/rd/:num', (req, res) => {
//   const round = +req.params.num;
//   if (typeof round === 'number') {
//     getAllScores('west', round);
//     getAllScores('east', round);
//   }
//   res.send('Thank you.');
// });

const port = process.env.PORT || 4501;

app.listen(port, () => console.log(`Server running on port ${port}.`));
