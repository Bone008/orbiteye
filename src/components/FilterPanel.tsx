import './FilterPanel.css';
import * as d3 from 'd3';
import React, { useMemo } from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Select, { MultiValue } from "react-select";
//import dataLoader from "./src/model/data_loader.ts"

export interface FilterPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

export interface FilterOptions {
  value: string;
  label: string;
}

/*export const OWNER_CODE_TO_LABEL: Record<string, string> = {
  public translations: Record<someTypes, ITranslation>;
  constructor(){
    this.buildTranslations = {
      ['category1']: {value: 'AB', label: 'Arab Satellite Communications Organization'}
    }
};*/

/** React component to render the global filter selection UI. */
export default function FilterPanel(props: FilterPanelProps) {
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

  //TO CHANGE
  const filterByOwner = (options: MultiValue<FilterOptions>) => {
    
    //this filters by owner, i.e. by shortCode
    const owners: string[] = options.map(option => option.value);
    //const owners2: string[] = options.map(option => option.label);
    const newFilter = props.filterSettings.update({ owners })
    props.onUpdateFilter(newFilter)

    //this filters by "fullname"
    //const owners: string[] = options.map(option => option.value[2]);
    //const newFilter = props.filterSettings.update({ owners })
    //props.onUpdateFilter(newFilter)
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
  
  //TO CHANGE
  const ownerOptions = uniqueOwners.map(ownerCode => {
    return { value: ownerCode, label: (ownerCode || 'All countries') }; //
  });

  const uniqueUsers: string[] = useMemo(() => {
    const usersSet = new Set<string>();
    for (const sat of props.allSatellites) {
      for (const user of sat.users) {
        usersSet.add(user);
      }
    }
    return Array.from(usersSet).sort();
  }, [props.allSatellites]);
  const usageOption = uniqueUsers.map(user => {
    const count = countWithUpdatedFilter({ userTypes: [user] });
    return { value: user, label: `${user} (${count})` };
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
