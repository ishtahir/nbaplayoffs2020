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
  setSeries,
  series,
  round,
}) => (
  <div className='matchup'>
    <ul
      className={round === 4 ? 'finals' : conference && conference}
      onClick={() => {
        setSeriesClicked(seriesName);
        setSeries(series);
      }}
    >
      <Team
        seed={highSeed ? highSeed : ''}
        img={highImg ? highImg : ''}
        mascot={highMascot ? highMascot : ''}
        wins={highWins >= 0 ? highWins : ''}
        high={true}
      />
      <Team
        seed={lowSeed ? lowSeed : ''}
        img={lowImg ? lowImg : ''}
        mascot={lowMascot ? lowMascot : ''}
        wins={lowWins >= 0 ? lowWins : ''}
        high={false}
      />
    </ul>
  </div>
);

export default Matchup;
