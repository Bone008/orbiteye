import './FilterPanel.css';
import * as d3 from 'd3';
import React, { useMemo } from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Select, { MultiValue } from "react-select";
import { OWNER_SHORT_CODE_TO_FULL } from '../model/mapping';



export interface FilterPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

/** Data representation of a single option in one of the filter dropdowns. */
interface FilterOption {
  value: string;
  label: string;
  count?: number;
  /** True if the option is selected according to the current filterSettings. */
  selected: boolean;
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
  const filterByOrbitClass = (options: MultiValue<FilterOption>) => {
    const orbitClass: OrbitClass[] | undefined = options.map(option => {
      return option.value as OrbitClass
    });

    const newFilter = props.filterSettings.update({ orbitClasses: orbitClass })
    props.onUpdateFilter(newFilter);
  };

  const filterByOwner = (options: MultiValue<FilterOption>) => {
    const owners: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ owners });
    props.onUpdateFilter(newFilter);
  };

  const filterByUsage = (options: MultiValue<FilterOption>) => {
    const userTypes: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ userTypes });
    props.onUpdateFilter(newFilter);
  };

  const filterByPurpose = (options: MultiValue<FilterOption>) => {
    const purposes: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ purposes });
    props.onUpdateFilter(newFilter);
  };

  const filterOnActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activeStatus = e.target.checked ? true : null;
    const newFilter = props.filterSettings.update({ activeStatus });
    props.onUpdateFilter(newFilter);
  }

  const orbitOptions: FilterOption[] = ALL_ORBIT_CLASSES.map(orbitClass => {
    const count = countWithUpdatedFilter({ orbitClasses: [orbitClass] });
    return {
      value: orbitClass,
      label: orbitClass,
      count,
      selected: currentFilter.orbitClasses.includes(orbitClass),
    };
  });

  /** Deduplicated owner values from all satellites. */
  const uniqueOwners: string[] = useMemo(
    () => Array.from(new Set(props.allSatellites.map(sat => sat.owner))).sort(),
    [props.allSatellites]);
  const ownerOptions: FilterOption[] = uniqueOwners.map(owner => {
    return {
      value: owner,
      label: OWNER_SHORT_CODE_TO_FULL[owner],
      selected: currentFilter.owners.includes(owner),
    };
  });

  /**Called "Sector" in the filter */
  const uniqueUsers: string[] = useMemo(
    () => uniqueListFromArrayValue(props.allSatellites, 'users'),
    [props.allSatellites]
  );
  const usageOptions: FilterOption[] = uniqueUsers.map(user => {
    const count = countWithUpdatedFilter({ userTypes: [user] });
    return {
      value: user,
      label: user,
      count,
      selected: currentFilter.userTypes.includes(user),
    };
  });

  /** Deduplicated purpose values from all satellites. */
  const uniquePurposes: string[] = useMemo(
    () => uniqueListFromArrayValue(props.allSatellites, 'purpose'),
    [props.allSatellites]
  );
  const purposeOptions: FilterOption[] = uniquePurposes.map(purpose => {
    return {
      value: purpose,
      label: purpose,
      selected: currentFilter.purposes.includes(purpose),
    };
  });

  /** Renders an option's "count" into a separately stylable element, so it can be hidden in the main select.  */
  const labelFormatter = (opt: FilterOption) => {
    const countSpan = <span className="optionValueCount">&nbsp;({opt.count})</span>;
    return <span key={opt.value}>{opt.label}{opt.count !== undefined && countSpan}</span>;
  };

  return (
    <div className="FilterPanel">
      <h1 className='headerName'>OrbitEye</h1>
      <p className='SatCountText'>Matches: {props.filteredSatellites.length} of {props.allSatellites.length} satellites.</p>

      <label className='FilterRowDiv'>
        <p className='FilterNameTag'> Orbit type:</p>
        <Select
          className='DropDown'
          classNamePrefix='DropDown'
          formatOptionLabel={labelFormatter}
          options={orbitOptions}
          value={orbitOptions.filter(opt => opt.selected)}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOrbitClass}
        />
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag'>Owner:</p>
        <Select
          className='DropDown'
          classNamePrefix='DropDown'
          formatOptionLabel={labelFormatter}
          options={ownerOptions}
          value={ownerOptions.filter(opt => opt.selected)
              /* Note: cannot use defaultValue instead of value because ownerOptions is initialized
                       with a delay (when allSatellites is available). */}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOwner}
        />
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag'>Sector:</p>
        <Select
          className='DropDown'
          classNamePrefix='DropDown'
          formatOptionLabel={labelFormatter}
          options={usageOptions}
          value={usageOptions.filter(opt => opt.selected)}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByUsage}
        />
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag'>Purpose:</p>
        <Select
          className='DropDown'
          options={purposeOptions}
          value={purposeOptions.filter(opt => opt.selected)}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByPurpose}
        />
      </label>
      <label className='FilterRowDiv'>
        <div>
          <span className='FilterNameTag'>Only active satellites:&nbsp;</span>
          <input
            name='activeToggle'
            type='checkbox'
            onChange={e => filterOnActive(e)}
            defaultChecked={currentFilter.activeStatus === true}
          />
        </div>
      </label>
    </div>
  );
}


// Adapted from: https://stackoverflow.com/a/56874389
type ArrayValuedKeys<T> = { [K in keyof T]-?: T[K] extends string[] ? K : never }[keyof T];

/** Returns a sorted, unique list of all values occuring in an array-valued column of a satellite. */
function uniqueListFromArrayValue(data: Satellite[], satelliteKey: ArrayValuedKeys<Satellite>) {
  const valueSet = new Set<string>();
  for (const sat of data) {
    for (const user of sat[satelliteKey]) {
      valueSet.add(user);
    }
  }
  return Array.from(valueSet).sort();
}