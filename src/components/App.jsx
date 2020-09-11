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
        <p>
          Series Table for series {seriesClicked.toUpperCase()} coming soon...
          <br />
          <button className='back-btn' onClick={() => setSeriesClicked('')}>
            Go Back
          </button>
        </p>
      )}
    </>
  );
};

export default App;
