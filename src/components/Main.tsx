import './Main.css';

import Timeline from './Timeline';
import ViewContainer from './ViewContainer';
import RightSidePanel from './RightSidePanel';
import Modal from 'react-modal';
import OrbitExplainer, { OrbitExplainerSlideName } from './OrbitExplainer';
import { FilterSettings } from '../model/filter_settings';
import { useEffect, useMemo, useState } from 'react';
import { OrbitClass, Satellite } from '../model/satellite';
import { fetchSatellitesAsync, fetchWorldMapAsync, WorldMapJSON } from '../model/data_loader';
import ReactModal from 'react-modal';
import { XIcon } from './Icons';
import { Route, Routes, useLocation } from 'react-router-dom';
import About, { AboutNav } from './About';

const DEFAULT_FILTER_SETTINGS = new FilterSettings({ activeStatus: true });

export function Main() {
  const [allSatellites, setAllSatellites] = useState<Satellite[]>([]);
  const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTER_SETTINGS);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [worldJson, setWorldJson] = useState<WorldMapJSON>({ type: "", name: "", crs: [""], features: [] })
  const [orbitExplainerState, setOrbitExplainerState] = useState<false | undefined | OrbitExplainerSlideName>(false);

  const updateSelected = (newSatellite: Satellite | null) => {
    if (newSatellite !== selectedSatellite) {
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

  const isHomePage = useLocation().pathname === "/";

  // Modal library requires this for accessibility
  ReactModal.setAppElement("#root");

  const openOrbitExplainer = (orbitPage?: OrbitClass) => {
    if (orbitPage) setOrbitExplainerState(orbitPage as OrbitExplainerSlideName);
    else setOrbitExplainerState(undefined);
  }

  return (
    <Routes>
      <Route path="about/*" element={<About />} />
      <Route path="*" element={
        <div className={`App ${isHomePage ? "expanded" : ""}`}>
          <AboutNav />
          <div className="mainView">
            <div className='mapView'>
              <ViewContainer allSatellites={allSatellites} filteredSatellites={filteredSatellites} onUpdateFilter={setFilterSettings} selectedSatellite={selectedSatellite} setSelectedSatellite={updateSelected} worldJson={worldJson} />
            </div >
            <RightSidePanel allSatellites={allSatellites} filteredSatellites={filteredSatellites} filterSettings={filterSettings} setFilterSettings={setFilterSettings} selectedSatellite={selectedSatellite} openOrbitExplainer={openOrbitExplainer} />
          </div >
          <Timeline allSatellites={allSatellites} filterSettings={filterSettings} onUpdateFilter={setFilterSettings} />

          <Modal
            isOpen={orbitExplainerState !== false}
            onRequestClose={() => setOrbitExplainerState(false)}
            contentLabel="Orbit Type Explainer Modal"
          >
            <XIcon onClick={() => setOrbitExplainerState(false)} height="2em" width="2em" style={{ position: "absolute", right: "5px", top: "5px", zIndex: 2 }} />
            <OrbitExplainer initialSlide={orbitExplainerState as OrbitExplainerSlideName | undefined} />
          </Modal>
        </div>
      } />
    </Routes>
  );
}