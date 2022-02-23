import './FilterPanel.css';
import * as d3 from 'd3';
import React, { useMemo } from 'react';
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
  value: string;
  label: string;
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

    const newFilter = props.filterSettings.update({ orbitClasses: orbitClass })
    props.onUpdateFilter(newFilter);
  };

  const filterByOwner = (options: MultiValue<FilterOptions>) => {
    const owners: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ owners })
    props.onUpdateFilter(newFilter)
  }

  const filterByUsage = (options: MultiValue<FilterOptions>) => {
    const userTypes: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ userTypes })
    props.onUpdateFilter(newFilter)
  }

  const orbitOptions = ALL_ORBIT_CLASSES.map(orbitClass => {
    const count = countWithUpdatedFilter({ orbitClasses: [orbitClass] });
    return { value: orbitClass, label: `${orbitClass} (${count})` };
  });

  // Deduplicate owners from all satellites. Kinda slow so memoized to run only when necessary.
  const uniqueOwners: string[] = useMemo(
    () => Array.from(new Set(props.allSatellites.map(sat => sat.owner))).sort(),
    [props.allSatellites]);
  const ownerOptions = uniqueOwners.map(ownerCode => {
    return { value: ownerCode, label: (ownerCode || 'All countries') };
  });

  const usageOption = ALL_USERS_TYPE.map(usage => {
    const count = countWithUpdatedFilter({ userTypes: [usage] });
    return { value: usage, label: `${usage} (${count})` };
  });

  return (
    <div className="FilterPanel">
      <h1 className='headerName'>OrbitEye</h1>
      <p>Showing {props.filteredSatellites.length} of {props.allSatellites.length} satellites.</p>

      <div className='MultiSelectDiv'>
        <p className='dropDownName'> Orbit type:</p>
        <Select
          className='MultiDropDown'
          options={orbitOptions}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOrbitClass}
        />
      </div>
      <div className='MultiSelectDiv'>
        <p className='dropDownName'>Owner:</p>
        <Select
          className='MultiDropDown'
          options={ownerOptions}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOwner}
        />
      </div>
      <div className='MultiSelectDiv'>
        <p className='dropDownName'>Usage type:</p>
        <Select
          className='MultiDropDown'
          options={usageOption}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByUsage}
        />
      </div>
    </div>
  );
}
