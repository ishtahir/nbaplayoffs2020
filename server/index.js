const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const nbaSeries = require('./series.js');
const { mongoPassword } = require('./config.js');
const allSeries = JSON.parse(
  fs.readFileSync('server/files/playoffs-all-series-2020.json')
);

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

mongoose.connect(
  `mongodb+srv://ish:${mongoPassword}@cluster0.acvuo.mongodb.net/<dbname>?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.get('/series/:name', (req, res) => {
  nbaSeries
    .findOne({ seriesName: req.params.name })
    .exec()
    .then((result) => {
      console.log('Success getting document!');
      res.status(200).json(result);
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: err, message: 'Could not properly get document!' })
    );
});

app.get('/series/rd/:rd', (req, res) => {
  nbaSeries
    .find({ round: +req.params.rd })
    .exec()
    .then((result) => {
      console.log('Success getting documents!');
      res.status(200).json(result);
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: err, message: 'Could not properly get documents!' })
    );
});

app.post('/series/:name', (req, res) => {
  const matchup = allSeries.find(
    (match) => match.seriesName === req.params.name
  );

  const series = new nbaSeries(matchup);
  nbaSeries
    .findOne({ seriesName: matchup.seriesName })
    .exec()
    .then((result) => {
      if (result === null) {
        series
          .save()
          .then((_) => {
            res.status(200).json({ message: 'Success creating document!' });
          })
          .catch((err) =>
            res.status(500).json({
              error: err,
              message: 'Could not properly create document!',
            })
          );
      } else {
        res.status(200).json({ message: 'Document already exists!' });
      }
    });
});

app.patch('/series/:name', (req, res) => {
  const matchup = allSeries.find(
    (match) => match.seriesName === req.params.name
  );
  const games = matchup.games;
  nbaSeries
    .updateOne({ seriesName: req.params.name }, { $set: { games: games } })
    .exec()
    .then((result) => {
      console.log('Success updating document!');
      res.status(200).json({
        message: `Games successfully updated for ${matchup.seriesName}`,
        res: result,
      });
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: 'Could not properly update document!',
      })
    );
});

app.delete('/series/:name', (req, res) => {
  nbaSeries
    .remove({ seriesName: req.params.name })
    .exec()
    .then((result) =>
      res.status(200).json({ message: `${req.params.name} has been deleted!` })
    )
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: 'Could not properly delete document!',
      })
    );
});

const port = process.env.PORT || 4501;

app.listen(port, () => console.log(`Server running on port ${port}.`));
