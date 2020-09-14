const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const nbaSeries = require('./series.js');
// const { mongoPassword, databaseName } = require('./config.js');
const mongoPassword =
  process.env.mongoPassword || require('./config.js').mongoPassword;
const databaseName =
  process.env.databaseName || require('./config.js').databaseName;

// const allSeries = JSON.parse(
//   fs.readFileSync('server/files/playoffs-all-series-2020.json')
// );

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

mongoose
  .connect(
    `mongodb+srv://ish:${mongoPassword}@cluster0.acvuo.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to Ish's MongoDB Atlas!"))
  .catch(() => console.log("COULD NOT CONNECT TO ISH'S MONGO ATLAS!"));

app.get('/series/:name', async (req, res) => {
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

app.get('/series/:conf/:link', async (req, res) => {
  nbaSeries
    .findOne({ link: `${req.params.conf}series${req.params.link}` })
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

app.get('/series/', (req, res) => {
  nbaSeries
    .find({})
    .exec()
    .then((result) => {
      console.log(`Success getting all documents`);
      res.status(200).json(result);
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: err, message: `Error getting all documents` })
    );
});

app.post('/series/:name', (req, res) => {
  // const matchup = allSeries.find(
  //   (match) => match.seriesName === req.params.name
  // );

  const series = new nbaSeries(req.body);
  nbaSeries
    .findOne({ seriesName: req.params.name })
    .exec()
    .then((result) => {
      if (result === null) {
        series
          .save()
          .then((_) => {
            res.status(200).json({
              message: `Success creating document: ${req.params.name}`,
            });
          })
          .catch((err) =>
            res.status(500).json({
              error: err,
              message: `Error creating document: ${req.params.name}`,
            })
          );
      } else {
        res
          .status(200)
          .json({ message: `Document already exists: ${req.params.name}` });
      }
    });
});

app.patch('/series/:name', (req, res) => {
  // const matchup = allSeries.find(
  //   (match) => match.seriesName === req.params.name
  // );
  // const changesObj = {};
  // for (const change of req.body) {
  //   changesObj[change] = matchup[change];
  // }
  // console.log(changesObj);
  nbaSeries
    .updateOne({ seriesName: req.params.name }, { $set: req.body })
    .exec()
    .then((result) =>
      res.status(200).json({
        message: `Success updating document: ${req.params.name}`,
        res: result,
      })
    )
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: `Error updating document: ${req.params.name}`,
      })
    );
});

app.delete('/series/:name', (req, res) => {
  nbaSeries
    .remove({ seriesName: req.params.name })
    .exec()
    .then((result) =>
      res.status(200).json({
        message: `Success deleting document: ${req.params.name}`,
        res: result,
      })
    )
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: `Error deleting document: ${req.params.name}`,
      })
    );
});

const port = process.env.PORT || 4501;

app.listen(port, () => console.log(`Server running on port ${port}.`));
