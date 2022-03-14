import './RightSidePanel.css'
import FilterPanel from './FilterPanel'
import SateliteDetailPanel from './SateliteDetailPanel'
import { useEffect, useState } from 'react'
import { FilterSettings, SetFilterCallback } from '../model/filter_settings'
import { Satellite } from '../model/satellite'

export interface RightPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  setFilterSettings: SetFilterCallback;
  selectedSatellite: Satellite | null;
  openOrbitExplainer: () => void;
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
      <div className='FilterPart'>
        <FilterPanel allSatellites={props.allSatellites} filteredSatellites={props.filteredSatellites} filterSettings={props.filterSettings} onUpdateFilter={props.setFilterSettings} openOrbitExplainer={props.openOrbitExplainer} />
      </div>
      <div className='DetailPart'>
        <SateliteDetailPanel satellite={props.selectedSatellite} showDetail={showDetailPanel} setShowDetail={setShowDetailPanel} />
      </div>
    </div>
  )
}