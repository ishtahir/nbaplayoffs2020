import React, { useState, useEffect } from 'react';
import Round1 from './Round1.jsx';
import Round2 from './Round2.jsx';
import Round3 from './Round3.jsx';
import Round4 from './Round4.jsx';
import axios from 'axios';

const Bracket = () => {
  const [round1Matches, setRound1Matches] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:4501/load')
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
  }, []);

  return (
    <div className='bracket'>
      <Round1 matchups={round1Matches} />
      <Round2 />
      <Round3 />
      <Round4 />
    </div>
  );
};

export default Bracket;
