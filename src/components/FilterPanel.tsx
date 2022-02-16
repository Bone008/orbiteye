import './FilterPanel.css';
import * as d3 from 'd3';
import React from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';

export interface FilterPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

/** React component to render the global filter selection UI. */
export default function FilterPanel(props: FilterPanelProps) {
  const currentFilter = props.filterSettings.filter;

  /** Computes how many rows match the filter after changing some value in it. */
  const countWithUpdatedFilter = (partialFilter: Partial<FilterProps>) => {
    // Note that this is kinda slow to run for all drop-downs, could be optimized by caching by the filter values.
    const newFilter = props.filterSettings.update(partialFilter);
    return d3.sum(props.allSatellites, sat => +newFilter.matchesSatellite(sat));
  }

  /** Updates the global filter. */
  const filterByOrbitClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orbitClass: OrbitClass | undefined = (e.target.value as OrbitClass) || undefined;
    const newFilter = props.filterSettings.update({ orbitClass });
    props.onUpdateFilter(newFilter);
  };


  const orbitClassOptions = [undefined, ...ALL_ORBIT_CLASSES].map(orbitClass => (
    <option value={orbitClass || ''}>
      {orbitClass || 'All'} ({countWithUpdatedFilter({ orbitClass })})
    </option>
  ));

  return (
    <div className="FilterPanel">
      Placeholder: FilterPanel
      <p>TESTING: Currently the filter includes {props.filteredSatellites.length} of {props.allSatellites.length} results.</p>
      <p>
        Filter by orbit class:&nbsp;
        <select onChange={filterByOrbitClass} value={currentFilter.orbitClass}>
          {orbitClassOptions}
        </select>
      </p>
    </div>
  );
}
