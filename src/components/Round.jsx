import React from 'react';
import Matchup from './Matchup.jsx';

const Round = ({ matchups, round, setSeriesClicked, setSeries }) => {
  return (
    <div className={`col rd${round}`}>
      {matchups.map((matchup, i) => (
        <Matchup
          key={`${matchup.seriesName}${i}`}
          conference={matchup.highSeed.conf}
          highSeed={matchup.highSeed.seed}
          lowSeed={matchup.lowSeed.seed}
          highWins={matchup.highSeed.wins}
          lowWins={matchup.lowSeed.wins}
          highImg={`${matchup.highSeed.short}.svg`}
          lowImg={`${matchup.lowSeed.short}.svg`}
          highMascot={matchup.highSeed.mascot}
          lowMascot={matchup.lowSeed.mascot}
          seriesName={matchup.seriesName}
          setSeriesClicked={setSeriesClicked}
          setSeries={setSeries}
          series={matchup}
        />
      ))}
    </div>
  );
};

export default Round;
