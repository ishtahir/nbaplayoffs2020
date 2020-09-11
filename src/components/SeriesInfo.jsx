import React from 'react';

const SeriesInfo = ({ series, setSeriesClicked }) => {
  function setStatus() {
    let status = '';
    const highSeed = series.highSeed;
    const lowSeed = series.lowSeed;
    if (highSeed.wins === 4) {
      status += `${highSeed.city} ${highSeed.mascot} defeated ${lowSeed.city} ${lowSeed.mascot}: ${highSeed.wins}-${lowSeed.wins}`;
    } else if (lowSeed.wins === 4) {
      status += `${lowSeed.city} ${lowSeed.mascot} defeated ${highSeed.city} ${highSeed.mascot}: ${lowSeed.wins}-${highSeed.wins}`;
    } else if (highSeed.wins > lowSeed.wins) {
      status += `${highSeed.city} ${highSeed.mascot} leads ${lowSeed.city} ${lowSeed.mascot}: ${highSeed.wins}-${lowSeed.wins}`;
    } else if (lowSeed.wins > highSeed.wins) {
      status += `${lowSeed.city} ${lowSeed.mascot} leads ${highSeed.city} ${highSeed.mascot}: ${lowSeed.wins}-${highSeed.wins}`;
    } else {
      status += `Series Tied: ${highSeed.wins}-${lowSeed.wins}`;
    }

    return status;
  }

  return (
    <table>
      <thead>
        <tr>
          <th className='info-team'>
            <span className='info-seed seed-left'>{series.highSeed.seed}</span>
            <img src={`images/${series.highSeed.short}.svg`} />
          </th>
          <th className='info-vs'>vs</th>
          <th className='info-team'>
            <span className='info-seed seed-right'>{series.lowSeed.seed}</span>
            <img src={`images/${series.lowSeed.short}.svg`} />
          </th>
        </tr>
        <tr>
          <th colSpan='4' className='info-status'>
            {setStatus()}
          </th>
        </tr>
      </thead>
      <tbody>
        {series.games.map((game, i) => (
          <tr key={game.game}>
            <td className='info-game'>Game {i + 1}</td>
            <td colSpan='3' className='info-game-result'>
              <a href='#' className='info-game-link'>
                {!game.homeScore && !game.awayScore
                  ? '*'
                  : game.homeScore > game.awayScore
                  ? `${game.homeTeam} ${game.homeScore}, ${game.awayTeam} ${game.awayScore}`
                  : `${game.awayTeam} ${game.awayScore}, ${game.homeTeam} ${game.homeScore}`}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan='4' className='info-if-nec'>
            * = if necessary
          </td>
        </tr>
        <tr>
          <td colSpan='4' className='info-back-btn'>
            <button className='back-btn' onClick={() => setSeriesClicked('')}>
              ← Back
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default SeriesInfo;
