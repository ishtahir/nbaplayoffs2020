import React from 'react';
import Team from './Team.jsx';

const Matchup = ({ conference, seed, wins, img, mascot }) => (
  <div className='matchup'>
    <ul className={conference}>
      <Team seed={seed} img={img} mascot={mascot} wins={wins} high={true} />
      <Team seed={seed} img={img} mascot={mascot} wins={wins} high={false} />
    </ul>
  </div>
);

export default Matchup;
