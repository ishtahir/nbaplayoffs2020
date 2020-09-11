import React, { useState } from 'react';
import Header from './Header.jsx';
import Bracket from './Bracket.jsx';

const App = () => {
  const [seriesClicked, setSeriesClicked] = useState('');

  return (
    <>
      <Header />
      {seriesClicked === '' ? (
        <Bracket setSeriesClicked={setSeriesClicked} />
      ) : (
        <p>Series Table coming soon...</p>
      )}
    </>
  );
};

export default App;
