import React from 'react';
import Nav from './Nav.jsx';

const Header = () => (
  <>
    <header className='header'>
      <h1 className='title'>
        <span className='text text-nba'>NBA</span>
        <span className='text text-playoffs'>Playoffs</span>
        <span className='text text-2020'>2020</span>
        <span className='text-wng'>#WholeNewGame</span>
      </h1>
    </header>
    <Nav />
  </>
);

export default Header;
