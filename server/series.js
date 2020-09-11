const mongoose = require('mongoose');
mongoose.set('debug', true);

const seriesSchema = new mongoose.Schema({
  seriesName: {
    type: String,
    required: true,
    lowercase: true,
  },
  link: {
    type: String,
    required: true,
    lowercase: true,
  },
  highSeed: {
    type: Map,
    required: true,
  },
  lowSeed: {
    type: Map,
    required: true,
  },
  games: {
    type: Array,
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  seriesOver: {
    type: Boolean,
    required: true,
  },
});

const nbaSeries = mongoose.model('nbaSeries', seriesSchema);

module.exports = nbaSeries;
