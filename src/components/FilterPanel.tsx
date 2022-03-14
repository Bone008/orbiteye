import './FilterPanel.css';
import * as d3 from 'd3';
import React, { useMemo } from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Select, { MultiValue, Props as SelectProps } from "react-select";
import { OWNER_SHORT_CODE_TO_FULL, ORBIT_TYPE_CODE_TO_FULL_NAME, } from '../model/mapping';
import { InfoCircleIcon } from './Icons'
import { Link } from 'react-router-dom';


export interface FilterPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
  openOrbitExplainer: () => void;
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
      label: ORBIT_TYPE_CODE_TO_FULL_NAME[orbitClass],
      count,
      selected: currentFilter.orbitClasses.includes(orbitClass),
    };
  });

  /** Deduplicated owner values from all satellites. */
  const uniqueOwners: string[] = useMemo(
    () => Array.from(new Set(props.allSatellites.map(sat => sat.owner))),
    [props.allSatellites]);
  const ownerOptions: FilterOption[] = uniqueOwners.map(owner => {
    return {
      value: owner,
      label: OWNER_SHORT_CODE_TO_FULL[owner] || owner,
      selected: currentFilter.owners.includes(owner),
    };
  }).sort((a, b) => a.label.localeCompare(b.label));

  /**Called "Sector" in the filter */
  const uniqueUsers: string[] = useMemo(
    () => uniqueListFromArrayValue(props.allSatellites, 'users').sort(),
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
    () => uniqueListFromArrayValue(props.allSatellites, 'purpose').sort(),
    [props.allSatellites]
  );
  const purposeOptions: FilterOption[] = uniquePurposes.map(purpose => {
    const count = countWithUpdatedFilter({ purposes: [purpose] });
    return {
      value: purpose,
      label: purpose,
      count,
      selected: currentFilter.purposes.includes(purpose),
    };
  });

  /** Renders an option's "count" into a separately stylable element, so it can be hidden in the main select.  */
  const labelFormatter = (opt: FilterOption) => {
    const countSpan = <span className="optionValueCount">&nbsp;({opt.count})</span>;
    return <span key={opt.value}>{opt.label}{opt.count !== undefined && countSpan}</span>;
  };

  const commonSelectProps: SelectProps<FilterOption, true> = {
    className: 'DropDown',
    classNamePrefix: 'DropDown',
    isMulti: true,
    isClearable: true,
    closeMenuOnSelect: false,
    hideSelectedOptions: false,
    // To avoid being cut off by panel overflow.
    menuPortalTarget: document.body,
  };

  return (
    <div className="FilterPanel">
      <Link to="/"> <h1 className='headerName'>OrbitEye</h1> </Link>
      <p className='SatCountText'>Matches: {props.filteredSatellites.length} of {props.allSatellites.length} satellites.</p>
      <label className='FilterRowDiv'>
        <div>
          <span className='FilterNameTag'>Only active satellites&nbsp;</span>

          <input
            //name='activeToggle'
            type='checkbox'
            className='checkBox'
            onChange={e => filterOnActive(e)}
            checked={currentFilter.activeStatus === true}

          />
        </div>
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag withInfo'><span>Orbit Type</span> <InfoCircleIcon className='infoIcon' onClick={props.openOrbitExplainer} /></p>
        <Select
          {...commonSelectProps}
          formatOptionLabel={labelFormatter}
          options={orbitOptions}
          value={orbitOptions.filter(opt => opt.selected)}
          onChange={filterByOrbitClass}
        />
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag'>Sector</p>
        <Select
          {...commonSelectProps}
          formatOptionLabel={labelFormatter}
          options={usageOptions}
          value={usageOptions.filter(opt => opt.selected)}
          onChange={filterByUsage}
        />
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag'>Purpose</p>
        <Select
          {...commonSelectProps}
          formatOptionLabel={labelFormatter}
          options={purposeOptions}
          value={purposeOptions.filter(opt => opt.selected)}
          onChange={filterByPurpose}
        />
      </label>
      <label className='FilterRowDiv'>
        <p className='FilterNameTag'>Owner</p>
        <Select
          {...commonSelectProps}
          formatOptionLabel={labelFormatter}
          options={ownerOptions}
          value={ownerOptions.filter(opt => opt.selected)
              /* Note: cannot use defaultValue instead of value because ownerOptions is initialized
                       with a delay (when allSatellites is available). */}
          onChange={filterByOwner}
          menuPortalTarget={document.body}
        />
      </label>
    </div>
  );
}


// Adapted from: https://stackoverflow.com/a/56874389
type ArrayValuedKeys<T> = { [K in keyof T]-?: T[K] extends string[] ? K : never }[keyof T];

/** Returns a sorted, unique list of all values occuring in an array-valued column of a satellite. */
function uniqueListFromArrayValue(data: Satellite[], satelliteKey: ArrayValuedKeys<Satellite>): string[] {
  const valueSet = new Set<string>();
  for (const sat of data) {
    for (const value of sat[satelliteKey]) {
      valueSet.add(value);
    }
  }

  // Hacky monkeypatch: "Earth Observation" is not a "purpose/user", but 1 row
  // contains it as such. Do not poison our drop down with it.
  // TODO Should be fixed upstream instead in the source.
  if (satelliteKey === 'users') {
    valueSet.delete('Earth Observation');
  }
  return Array.from(valueSet);
}