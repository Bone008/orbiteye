import './FilterPanel.css';
import * as d3 from 'd3';
import React from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite, ALL_USERS_TYPE } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Select, { MultiValue } from "react-select";



export interface FilterPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

interface FilterOptions {
  value: String | undefined;
  label: String;
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
  const filterByOrbitClass = (options: MultiValue<FilterOptions>) => {
    const orbitClass: OrbitClass[] | undefined = options.map(option => {
      return option.value as OrbitClass
    })

    const newFilter = props.filterSettings.update({ orbitClass })
    props.onUpdateFilter(newFilter);
  };

  const filterByOwner = (options: MultiValue<FilterOptions>) => {
    const owner: String[] | undefined = options.map(option => {
      return option.value as String
    })

    const newFilter = props.filterSettings.update({ owner })
    props.onUpdateFilter(newFilter)
  }

  const filterByUsage = (options: MultiValue<FilterOptions>) => {
    const userType: String[] | undefined = options.map(option => {
      return option.value as String
    })

    const newFilter = props.filterSettings.update({ userType })
    props.onUpdateFilter(newFilter)
  }

  const orbitOptions = [undefined, ...ALL_ORBIT_CLASSES].map(orbitClass => {
    const orbitClassList: OrbitClass[] | undefined = [orbitClass as OrbitClass]
    return {
      value: orbitClass, label: (orbitClass || 'All orbit classes')
      /* TODO: Add to see rows that matches using countWithUpdatedFilter*/
    }
  });

  const ownerOptions = [undefined, ...props.allSatellites.map(sat => sat.owner)].filter((value, index, self) => self.indexOf(value) === index).map(ownerCode => {
    return { value: ownerCode, label: (ownerCode || 'All countries') }
  })

  const usageOption = [undefined, ...ALL_USERS_TYPE].map(usage => {
    return { value: usage, label: (usage || 'All usage') }
  }
  )

  return (
    <div className="FilterPanel">
      FILTER
      <p>TESTING: Currently the filter includes {props.filteredSatellites.length} of {props.allSatellites.length} results.</p>

      <div className='MultiSelectDiv'>
        <p> Orbit type:</p>
        <Select
          className='MultiDropDown'
          options={orbitOptions}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOrbitClass}
        />
      </div>
      <div className='MultiSelectDiv'>
        <p>Owner:</p>
        <Select
          className='MultiDropDown'
          options={ownerOptions}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOwner}
        />
      </div>
      <div className='MultiSelectDiv'>
        <p>Usage type:</p>
        <Select
          className='MultiDropDown'
          options={usageOption}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByUsage}
        />
      </div>
    </div>
  );
}
