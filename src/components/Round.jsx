import React from 'react';
import Matchup from './Matchup.jsx';

const Round = ({ matchups, round, setSeriesClicked }) => {
  return (
    <div className={`col rd${round}`}>
      {matchups.map(({ conf, seriesName, highSeed, lowSeed }, i) => (
        <Matchup
          key={`${seriesName}${i}`}
          conference={highSeed.conf}
          highSeed={highSeed.seed}
          lowSeed={lowSeed.seed}
          highWins={highSeed.wins}
          lowWins={lowSeed.wins}
          highImg={`${highSeed.short}.svg`}
          lowImg={`${lowSeed.short}.svg`}
          highMascot={highSeed.mascot}
          lowMascot={lowSeed.mascot}
          seriesName={seriesName}
          setSeriesClicked={setSeriesClicked}
        />
      ))}
    </div>
  );
};

export default Round;
