import React from 'react';
import Matchup from './Matchup.jsx';

const Round4 = () => {
  return (
    <div className='col rd4'>
      <Matchup
        conference='finals'
        highSeed={1}
        lowSeed={1}
        highSeedWins={0}
        lowSeedWins={0}
      />
    </div>
  );
};

export default Round4;
