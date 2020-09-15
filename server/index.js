const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const { nbaSeries, settingsForPlayoffs } = require('./schemas.js');

const mongoPassword =
  process.env.mongoPassword || require('./config.js').mongoPassword;
const databaseName =
  process.env.databaseName || require('./config.js').databaseName;

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

app.get('/team/:name', (req, res) => {
  nbaSeries
    .find({ seriesName: new RegExp(req.params.name) })
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

/*

SETTINGS ROUTES BELOW

*/

app.post('/settings', (req, res) => {
  const settings = new settingsForPlayoffs(req.body);
  settings
    .save()
    .then((_) => {
      res.status(200).json({
        message: `Success creating settings document`,
      });
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: `Error creating settings document`,
      })
    );
});

app.get('/settings', (req, res) => {
  settingsForPlayoffs
    .findOne({ typeName: 'SETTINGS' })
    .exec()
    .then((result) => {
      console.log('Success getting settings document!');
      res.status(200).json(result);
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: 'Could not properly get settings document!',
      })
    );
});

app.get('/settings/:team', (req, res) => {
  settingsForPlayoffs
    .findOne({ typeName: 'SETTINGS' })
    .exec()
    .then((result) => {
      // console.log('Success getting settings document!');
      const { westTeams, eastTeams } = result;
      const teams = [...westTeams, ...eastTeams];
      const team = teams.filter(
        (team) => team.short === req.params.team.toUpperCase()
      );
      res.status(200).json(team[0]);
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: 'Could not properly get settings document!',
      })
    );
});

app.patch('/settings', (req, res) => {
  settingsForPlayoffs
    .updateOne({ typeName: 'SETTINGS' }, { $set: req.body })
    .exec()
    .then((result) =>
      res.status(200).json({
        message: `Success updating settings document`,
        res: result,
      })
    )
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: `Error updating settings document`,
      })
    );
});

app.delete('/settings', (req, res) => {
  nbaSeries
    .remove({ typeName: 'SETTINGS' })
    .exec()
    .then((result) =>
      res.status(200).json({
        message: `Success deleting settings document`,
        res: result,
      })
    )
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: `Error deleting settings document`,
      })
    );
});

const port = process.env.PORT || 4501;

app.listen(port, () => console.log(`Server running on port ${port}.`));
