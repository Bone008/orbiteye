import './App.css';

import { useEffect, useMemo, useState } from 'react';
import { fetchSatellitesAsync } from './model/data_loader';
import { Satellite } from './model/satellite';
import { FilterSettings } from './model/filter_settings';
import FilterPanel from './components/FilterPanel';
import Timeline from './components/Timeline';
import StaticWorldMap from './components/StaticWorldMap';
import SVGWorldMap from './components/SVGWorldMap';
import GlobeView from './components/GlobeView';
import { HashRouter, Route, Routes } from 'react-router-dom';
import ViewSelector from './components/ViewSelector';

function App() {
  const [allSatellites, setAllSatellites] = useState<Satellite[]>([]);
  const [filterSettings, setFilterSettings] = useState(new FilterSettings());

  // Applies the current filter settings, executed only when necessary.
  const filteredSatellites = useMemo(() => {
    const startTime = performance.now();
    const result = allSatellites.filter(sat => filterSettings.matchesSatellite(sat));
    const endTime = performance.now();
    console.log(`Filtered ${result.length} of ${allSatellites.length} rows in ${endTime - startTime
      } ms using settings:`, filterSettings.filter);
    return result;
  }, [allSatellites, filterSettings]);

  const initialize = async () => {
    setAllSatellites(await fetchSatellitesAsync());
  };

  return (
    <div className="App">
      <div className='mainView'>
        <a className='modeBTN' href="#/"> MODE </a>
        <div className='mapView'>
          <HashRouter>
            <Routes>
              <Route path="/" element={<ViewSelector />} />
              <Route path="/orbits/globe" element={<GlobeView filteredSatellites={filteredSatellites} />} />
              <Route path="/orbits/map" element={<StaticWorldMap filteredSatellites={filteredSatellites} height={500} width={1000} />} />
              <Route path="/origin" element={<SVGWorldMap filteredSatellites={filteredSatellites} height={500} width={1000} />} />
            </Routes>
          </HashRouter>
        </div>
        <div>
        <td>
          <FilterPanel allSatellites={allSatellites} filteredSatellites={filteredSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />
        <tr>
        </tr>
        <tr>

        <body>
        <form action="http://localhost:3000/#/orbits/map"> 
          <button type="submit">2D view</button>
        </form>

        <form action="http://localhost:3000/#/orbits/globe"> 
          <button type="submit">3D view</button>
        </form>

        </body>

        </tr>
        </td>
        </div>

      </div>
      <Timeline allSatellites={allSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />
    </div>
  );
}

export default App;
