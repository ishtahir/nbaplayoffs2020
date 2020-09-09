import React from 'react';
import Matchup from './Matchup.jsx';

const Round1 = () => {
  return (
    <div className='col rd1'>
      <Matchup
        conference='west'
        highSeed={1}
        lowSeed={8}
        highSeedWins={0}
        lowSeedWins={0}
        highSeedImg='LAL.svg'
        lowSeedImg='POR.svg'
        highSeedMascot='Lakers'
        lowSeedMascot='Trailblazers'
      />
      <Matchup
        conference='west'
        highSeed={4}
        lowSeed={5}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='west'
        highSeed={2}
        lowSeed={7}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='west'
        highSeed={3}
        lowSeed={6}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={1}
        lowSeed={8}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={4}
        lowSeed={5}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={2}
        lowSeed={7}
        highSeedWins={0}
        lowSeedWins={0}
      />
      <Matchup
        conference='east'
        highSeed={3}
        lowSeed={6}
        highSeedWins={0}
        lowSeedWins={0}
      />
    </div>
  );
};

export default Round1;
