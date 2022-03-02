import './App.css';

import { useEffect, useMemo, useState } from 'react';
import { fetchSatellitesAsync, fetchWorldMapAsync, WorldMapJSON } from './model/data_loader';
import { Satellite } from './model/satellite';
import { FilterSettings } from './model/filter_settings';
import Timeline from './components/Timeline';
import ViewContainer from './components/ViewContainer';
import RightSidePanel from './components/RightSidePanel';
import WorldMap from './components/StaticWorldMap';
import { Feature } from 'geojson';

const DEFAULT_FILTER_SETTINGS = new FilterSettings({ activeStatus: true });

export default function App() {
  const [allSatellites, setAllSatellites] = useState<Satellite[]>([]);
  const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTER_SETTINGS);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [worldJson, setWorldJson] = useState<WorldMapJSON>({ type: "", name: "", crs: [""], features: [] })

  const updateSelected = (newSatellite: Satellite | null) => {
    if (newSatellite !== selectedSatellite) {
      console.log('Selecting:', newSatellite ? newSatellite.id : null);
      setSelectedSatellite(newSatellite);
    }
  };

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
    setWorldJson(await fetchWorldMapAsync());
  };

  useEffect(() => { initialize(); }, []);

  /*Test data to show in the panel. Will be deleted later for actual data, but will do for now */
  const test = {
    name: 'Name A',
    launchDate: '2022-02-26',
    status: 'Operational'
  }

  return (
    <div className="App">
      <div className='mainView'>
        <div className='mapView'>
          <ViewContainer filteredSatellites={filteredSatellites} selectedSatellite={selectedSatellite} setSelectedSatellite={updateSelected} worldJson={worldJson} />
        </div >
        <RightSidePanel allSatellites={allSatellites} filteredSatellites={filteredSatellites} filterSettings={filterSettings} setFilterSettings={setFilterSettings} name={test.name} launchDate={test.launchDate} status={test.status} />
      </div >
      <Timeline allSatellites={allSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />
    </div >
  );
}
