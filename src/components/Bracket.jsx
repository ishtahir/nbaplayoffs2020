import React, { useState, useEffect } from 'react';
import Round from './Round.jsx';
import axios from 'axios';

const Bracket = () => {
  const [round1Matches, setRound1Matches] = useState([]);
  const [round2Matches, setRound2Matches] = useState([]);
  const [round3Matches, setRound3Matches] = useState([
    {
      conf: '',
      highSeed: { city: '', mascot: '', short: '' },
      lowSeed: { city: '', mascot: '', short: '' },
      seriesName: '',
    },
    {
      conf: '',
      highSeed: { city: '', mascot: '', short: '' },
      lowSeed: { city: '', mascot: '', short: '' },
      seriesName: '',
    },
  ]);
  const [round4Matches, setRound4Matches] = useState([
    {
      conf: '',
      highSeed: { city: '', mascot: '', short: '' },
      lowSeed: { city: '', mascot: '', short: '' },
      seriesName: '',
    },
  ]);

  useEffect(() => {
    axios
      .get('http://localhost:4501/scores/east/2')
      .then((data) => console.log(data.data));
    axios
      .get('http://localhost:4501/load/rd/1')
      .then((data) => {
        const seeding = {};
        const order = [1, 4, 2, 3];
        for (let i = 0; i < order.length; i++) {
          seeding[order[i]] = i;
        }
        setRound1Matches(
          data.data.sort((a, b) => {
            if (a.conf === b.conf) {
              return seeding[a.highSeed.seed] - seeding[b.highSeed.seed];
            }
          })
        );
      })
      .catch((err) => console.log);

    axios
      .get('http://localhost:4501/load/rd/2')
      .then((data) => {
        const seeding = {};
        const order = [1, 4, 2, 3];
        for (let i = 0; i < order.length; i++) {
          seeding[order[i]] = i;
        }
        setRound2Matches(
          data.data.sort((a, b) => {
            if (a.conf === b.conf) {
              return seeding[a.highSeed.seed] - seeding[b.highSeed.seed];
            }
          })
        );
      })
      .catch((err) => console.log);
  }, []);

  return (
    <div className='bracket'>
      <Round round={1} matchups={round1Matches} />
      <Round round={2} matchups={round2Matches} />
      <Round round={3} matchups={round3Matches} />
      <Round round={4} matchups={round4Matches} />
    </div>
  );
};

export default Bracket;
