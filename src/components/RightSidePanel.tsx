import './RightSidePanel.css'
import FilterPanel from './FilterPanel'
import SateliteDetailPanel from './SateliteDetailPanel'
import { useLayoutEffect, useRef, useState } from 'react'
import { FilterSettings, SetFilterCallback } from '../model/filter_settings'
import { Satellite } from '../model/satellite'

export interface RightPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  setFilterSettings: SetFilterCallback;
  name?: string;
  launchDate?: string;
  status?: string;
}


export default function RightSidePanel(props: RightPanelProps) {
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    if (showDetailPanel) {
      ref.current.style.height = '75%'
    } else {
      ref.current.style.height = '90%'
    }
  }, []);

  return (
    <div className='RightPanel'>
      <div ref={ref} className='FilterPart'>
        <FilterPanel allSatellites={props.allSatellites} filteredSatellites={props.filteredSatellites} filterSettings={props.filterSettings} onUpdateFilter={props.setFilterSettings} />
      </div>
      <div className='DetailPart'>
        <SateliteDetailPanel name={props.name} launchDate={props.launchDate} status={props.status} showDetail={showDetailPanel} setShowDetail={setShowDetailPanel} />
      </div>
    </div>
  )
}