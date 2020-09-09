import React from 'react';

const Matchup = ({
  conference,
  highSeed,
  lowSeed,
  highSeedWins,
  lowSeedWins,
}) => (
  <div className='matchup'>
    <ul className={conference}>
      <li>
        <span className='seed-left seed'>{highSeed}</span>
        <span className='wins'>{highSeedWins}</span>
      </li>
      <li>
        <span className='seed-right seed'>{lowSeed}</span>
        <span className='wins'>{lowSeedWins}</span>
      </li>
    </ul>
  </div>
);

export default Matchup;
