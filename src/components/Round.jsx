import React from 'react';
import Matchup from './Matchup.jsx';

const Round = ({ matchups, round, setSeriesClicked, setSeries }) => {
  function navText() {
    let text = '';
    if (round === 1) {
      text += 'Round 1';
    } else if (round === 2) {
      text += 'Conf. Semi-Finals';
    } else if (round === 3) {
      text += 'Conference Finals';
    } else {
      text += 'NBA Finals';
    }
    return text;
  }
  return (
    <div className={`col rd${round}`}>
      <span className='nav-item'>{navText()}</span>
      {matchups.map((matchup, i) => (
        <Matchup
          key={`${matchup.seriesName}${i}`}
          round={round}
          conference={matchup.highSeed.conf}
          highSeed={matchup.highSeed.seed}
          lowSeed={matchup.lowSeed.seed}
          highWins={matchup.highSeed.wins}
          lowWins={matchup.lowSeed.wins}
          highImg={matchup.highSeed.short}
          lowImg={matchup.lowSeed.short}
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
