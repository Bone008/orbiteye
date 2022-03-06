import './App.css';

import { useEffect, useMemo, useState } from 'react';
import { fetchSatellitesAsync, fetchWorldMapAsync, WorldMapJSON } from './model/data_loader';
import { Satellite } from './model/satellite';
import { FilterSettings } from './model/filter_settings';
import Timeline from './components/Timeline';
import ViewContainer from './components/ViewContainer';
import RightSidePanel from './components/RightSidePanel';
import Modal from 'react-modal';
import OrbitExplainer from './components/OrbitExplainer';
import ReactModal from 'react-modal';
import { XIcon } from './components/Icons';
import { HashRouter } from 'react-router-dom';

const DEFAULT_FILTER_SETTINGS = new FilterSettings({ activeStatus: true });

export default function App() {
  const [allSatellites, setAllSatellites] = useState<Satellite[]>([]);
  const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTER_SETTINGS);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [worldJson, setWorldJson] = useState<WorldMapJSON>({ type: "", name: "", crs: [""], features: [] })
  const [orbitExplainerOpen, setOrbitExplainerOpen] = useState(false);

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

  // Modal library requires this for accessibility
  ReactModal.setAppElement("#root");

  return (
    <div className="App">
      <div className='mainView'>
        <div className='mapView'>
          <HashRouter>
            <ViewContainer filteredSatellites={filteredSatellites} selectedSatellite={selectedSatellite} setSelectedSatellite={updateSelected} worldJson={worldJson} />
          </HashRouter>
        </div >
        <RightSidePanel allSatellites={allSatellites} filteredSatellites={filteredSatellites} filterSettings={filterSettings} setFilterSettings={setFilterSettings} selectedSatellite={selectedSatellite} openOrbitExplainer={() => setOrbitExplainerOpen(true)} />
      </div >
      <Timeline allSatellites={allSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />

      <Modal
        isOpen={orbitExplainerOpen}
        onRequestClose={() => setOrbitExplainerOpen(false)}
        contentLabel="Orbit Type Explainer Modal"
      >
        <XIcon onClick={() => setOrbitExplainerOpen(false)} height="2em" width="2em" style={{ position: "absolute", right: "5px", top: "5px", zIndex: 2 }} />
        <OrbitExplainer />
      </Modal>
    </div >
  );
}
