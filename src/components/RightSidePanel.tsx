import './RightSidePanel.css'
import FilterPanel from './FilterPanel'
import SatelliteDetailPanel from './SatelliteDetailPanel'
import { useEffect, useState } from 'react'
import { FilterSettings, SetFilterCallback } from '../model/filter_settings'
import { OrbitClass, Satellite } from '../model/satellite'
import { Link } from 'react-router-dom'

export interface RightPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  setFilterSettings: SetFilterCallback;
  selectedSatellite: Satellite | null;
  openOrbitExplainer: (orbitPage?: OrbitClass) => void;
}


export default function RightSidePanel(props: RightPanelProps) {
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);

  useEffect(() => {
    const shouldShow = !!props.selectedSatellite;
    if (showDetailPanel !== shouldShow) {
      setShowDetailPanel(shouldShow);
    }
  }, [props.selectedSatellite, /*showDetailPanel <-- This is intentionally NOT part of the deps since it would just reset itself again.*/]);

  return (
    <div className='RightPanel'>
      <div className='header'>
        <Link to="/" className='headerName' title="Home"> <h1>OrbitEye</h1> </Link>
        <Link to="about" className='aboutLink'>About</Link>
      </div>

      <div className='FilterPart'>
        <FilterPanel allSatellites={props.allSatellites} filteredSatellites={props.filteredSatellites} filterSettings={props.filterSettings} onUpdateFilter={props.setFilterSettings} openOrbitExplainer={props.openOrbitExplainer} />
      </div>
      <div className='DetailPart'>
        <SatelliteDetailPanel satellite={props.selectedSatellite} showDetail={showDetailPanel} setShowDetail={setShowDetailPanel} openOrbitExplainer={props.openOrbitExplainer} />
      </div>
    </div>
  )
}