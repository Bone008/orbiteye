import { useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { fetchSatellitesAsync } from './model/data_loader';
import { Satellite } from './model/satellite';
import { FilterSettings } from './model/filter_settings';
import FilterPanel from './components/FilterPanel';
import Timeline from './components/Timeline';
import StaticWorldMap from './components/StaticWorldMap';
import SVGWorldMap from './components/SVGWorldMap';
import GlobeView from './components/GlobeView';

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

  useEffect(() => { initialize(); }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          OrbitEye
        </p>
        DEBUG: {filteredSatellites.length} filtered satellites
      </header>
      <FilterPanel allSatellites={allSatellites} filteredSatellites={filteredSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />
      <Timeline allSatellites={allSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />
    </div>
  );
}

/**
        <GlobeView filteredSatellites={filteredSatellites} />
      <StaticWorldMap filteredSatellites={filteredSatellites} height={500} width={1000} />
  
 */

export default App;
