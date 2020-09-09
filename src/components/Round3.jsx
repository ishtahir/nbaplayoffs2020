import React from 'react';
import Matchup from './Matchup.jsx';

const Round3 = () => {
  return (
    <div className='col rd3'>
      <Matchup
        conference='west'
        highSeed={1}
        lowSeed={2}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={1}
        lowSeed={2}
        highSeedWins={0}
        lowSeedWins={0}
      />
    </div>
  );
};

export default Round3;
