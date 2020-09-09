import React from 'react';

const Team = ({ seed, img, mascot, wins, high }) => {
  return (
    <li>
      <span className={`seed ${high ? 'seed-left' : 'seed-right'}`}>
        {seed}
      </span>
      <span className='team'>
        <img
          src={`images/${img}`}
          className={`${mascot}-img`}
          alt={`${mascot} Logo`}
        />
      </span>
      <span className='wins'>{wins}</span>
    </li>
  );
};

export default Team;
