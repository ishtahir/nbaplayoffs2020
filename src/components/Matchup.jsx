import React from 'react';
import Team from './Team.jsx';

const Matchup = ({
  conference,
  highSeed,
  lowSeed,
  highWins,
  lowWins,
  highImg,
  lowImg,
  highMascot,
  lowMascot,
  seriesName,
  setSeriesClicked,
}) => (
  <div className='matchup'>
    <ul className={conference} onClick={() => setSeriesClicked(seriesName)}>
      <Team
        seed={highSeed}
        img={highImg ? highImg : ''}
        mascot={highMascot}
        wins={highWins}
        high={true}
      />
      <Team
        seed={lowSeed}
        img={lowImg ? lowImg : ''}
        mascot={lowMascot}
        wins={lowWins}
        high={false}
      />
    </ul>
  </div>
);

export default Matchup;
