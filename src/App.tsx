import React, { useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Timeline from './components/Timeline';
import { fetchSatellitesAsync } from './model/data_loader';
import { Satellite } from './model/satellite';
import { FilterSettings } from './model/filter_settings';

function App() {
  const [allSatellites, setAllSatellites] = useState<Satellite[]>([]);
  const [filterSettings, setFilterSettings] = useState(new FilterSettings());

  // Applies the current filter settings, executed whenever necessary.
  const filteredSatellites = useMemo(() => {
    const result = allSatellites.filter(sat => filterSettings.matchesSatellite(sat));
    console.log(`Filtered ${result.length} of ${allSatellites.length} rows!`);
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

      <Timeline allSatellites={allSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />
    </div>
  );
}

export default App;
