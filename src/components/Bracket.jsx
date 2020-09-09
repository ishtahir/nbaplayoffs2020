import React from 'react';
import Round1 from './Round1.jsx';
import Round2 from './Round2.jsx';
import Round3 from './Round3.jsx';
import Round4 from './Round4.jsx';

const Bracket = () => {
  return (
    <div className='bracket'>
      <Round1 />
      <Round2 />
      <Round3 />
      <Round4 />
    </div>
  );
};

export default Bracket;
