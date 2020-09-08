const express = require('express');
const fs = require('fs');
const { getAllScores } = require('./getData.js');

const app = express();

app.get('/load', (req, res) => {
  const playoffs = JSON.parse(
    fs.readFileSync('server/files/playoffs-round1.json', 'utf8')
  );
  res.send(playoffs);
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
