import React from 'react';

const Team = ({ seed, img, mascot, wins, high }) => {
  return (
    <li>
      <span className={`seed ${high ? 'seed-left' : 'seed-right'}`}>
        {seed}
      </span>
      <span className='team'>
        <img
          src={img === '' ? '' : `images/${img}.svg`}
          className={img === '' ? 'hide' : `${mascot}-img`}
          alt={mascot ? `${mascot} Logo` : ''}
        />
      </span>
      <span className={wins === '' ? 'wins hide' : 'wins'}>{wins}</span>
    </li>
  );
};

export default Team;
