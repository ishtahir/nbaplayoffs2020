import React from 'react';
import Matchup from './Matchup.jsx';

const Round2 = () => {
  return (
    <div className='col rd2'>
      <Matchup
        conference='west'
        highSeed={1}
        lowSeed={4}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='west'
        highSeed={2}
        lowSeed={3}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={1}
        lowSeed={4}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={2}
        lowSeed={3}
        highSeedWins={0}
        lowSeedWins={0}
      />
    </div>
  );
};

export default Round2;
