import React, { useState } from 'react';
import Header from './Header.jsx';
import Bracket from './Bracket.jsx';
import SeriesInfo from './SeriesInfo.jsx';

const App = () => {
  const [seriesClicked, setSeriesClicked] = useState('');
  const [series, setSeries] = useState({});

  return (
    <>
      <Header />
      {seriesClicked === '' ? (
        <Bracket setSeriesClicked={setSeriesClicked} setSeries={setSeries} />
      ) : (
        <SeriesInfo series={series} setSeriesClicked={setSeriesClicked} />
      )}
    </>
  );
};

export default App;
