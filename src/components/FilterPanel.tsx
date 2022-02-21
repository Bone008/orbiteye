import './FilterPanel.css';
import * as d3 from 'd3';
import React from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Select, { MultiValue } from "react-select";



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
  const filterByOrbitClass = (options: MultiValue<{ value: "LEO" | "GEO" | "MEO" | "Elliptical" | undefined; label: string; }>) => {
    console.log(options)

    const orbitClass: OrbitClass[] | undefined = options.map(option => {
      return option.value as OrbitClass
    })

    const newFilter = props.filterSettings.update({ orbitClass })
    props.onUpdateFilter(newFilter);
  };

  const orbitOptions = [undefined, ...ALL_ORBIT_CLASSES].map(orbitClass => {
    const orbitClassList: OrbitClass[] | undefined = [orbitClass as OrbitClass]
    return {
      value: orbitClass, label: (orbitClass || 'All orbit classes')
      /* Add to see rows that row that matches with countWithUpdatedFilter() */
    }
  });

  return (
    <div className="FilterPanel">
      FILTER
      <p>TESTING: Currently the filter includes {props.filteredSatellites.length} of {props.allSatellites.length} results.</p>

      <p> Filter by Orbit type: 
        <Select
          options={orbitOptions}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOrbitClass}
        />
      </p>
    </div>
  );
}
