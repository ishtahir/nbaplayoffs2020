import React from 'react';
import Matchup from './Matchup.jsx';

const Round1 = ({ matchups }) => {
  return (
    <div className='col rd1'>
      {matchups.map(({ conf, seriesName, highSeed, lowSeed }) => (
        <Matchup
          key={seriesName}
          conference={conf}
          highSeed={highSeed.seed}
          lowSeed={lowSeed.seed}
          highWins={highSeed.wins}
          lowWins={lowSeed.wins}
          highImg={`${highSeed.short}.svg`}
          lowImg={`${lowSeed.short}.svg`}
          highMascot={highSeed.mascot}
          lowMascot={lowSeed.mascot}
        />
      ))}
    </div>
  );
};

export default Round1;
