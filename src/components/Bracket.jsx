import React from 'react';
import Matchup from './Matchup.jsx';

const Bracket = () => {
  return (
    <div className='bracket'>
      <div className='col rd1'>
        <Matchup
          conference='west'
          highSeed={1}
          lowSeed={8}
          highSeedWins={0}
          lowSeedWins={0}
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
      <div className='col rd4'>
        <Matchup
          conference='finals'
          highSeed={1}
          lowSeed={1}
          highSeedWins={0}
          lowSeedWins={0}
        />
      </div>
    </div>
  );
};

export default Bracket;
