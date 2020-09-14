import React, { useState, useEffect } from 'react';
import Round from './Round.jsx';
import axios from 'axios';

const Bracket = ({ setSeriesClicked, setSeries }) => {
  const [allMatches, setAllMatches] = useState([]);

  useEffect(() => {
    axios
      .get('https://secret-gorge-48165.herokuapp.com//series')
      .then((data) => {
        const seeding = {};
        const order = [1, 4, 2, 3];
        for (let i = 0; i < order.length; i++) {
          seeding[order[i]] = i;
        }

        setAllMatches(
          data.data.sort((a, b) => {
            if (a.highSeed.conf > b.highSeed.conf) {
              return -1;
            } else if (b.highSeed.conf > a.highSeed.conf) {
              return 1;
            } else {
              return seeding[a.highSeed.seed] - seeding[b.highSeed.seed];
            }
          })
        );
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className='bracket'>
      <Round
        round={1}
        matchups={[
          ...allMatches.sort((a, b) => a.highSeed.conf - b.highSeed.conf),
        ].filter((match) => match.round === 1)}
        setSeriesClicked={setSeriesClicked}
        setSeries={setSeries}
      />
      <Round
        round={2}
        matchups={allMatches.filter((match) => match.round === 2)}
        setSeriesClicked={setSeriesClicked}
        setSeries={setSeries}
      />
      <Round
        round={3}
        matchups={[
          {
            highSeed: {
              city: 'LA',
              mascot: 'Lakers',
              short: 'LAL',
              seed: 1,
              wins: 0,
              conf: 'west',
            },
            lowSeed: {
              city: '',
              mascot: '',
              short: '',
              seed: '',
              wins: '',
            },
            seriesName: '',
          },
          ...allMatches.filter((match) => match.round === 3),
        ]}
        setSeriesClicked={setSeriesClicked}
        setSeries={setSeries}
      />
      <Round
        round={4}
        matchups={[
          {
            highSeed: {
              city: '',
              mascot: '',
              short: '',
              seed: '',
              wins: '',
              conf: 'finals',
            },
            lowSeed: {
              city: '',
              mascot: '',
              short: '',
              seed: '',
              wins: '',
            },
            seriesName: '',
          },
        ]}
      />
    </div>
  );
};

export default Bracket;
