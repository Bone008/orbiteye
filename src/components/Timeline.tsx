import './Timeline.css';
import { useMemo } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { FilterSettings, SetFilterCallback } from '../model/filter_settings';

export interface TimelineProps {
  allSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

/** React component to render the timeline and date range selection UI. */
export default function Timeline(props: TimelineProps) {
  // Use memoization to make sure this is only computed once.
  const [datasetMinDate, datasetMaxDate] = useMemo(() => {
    const launchDates = props.allSatellites.map(sat => sat.launchDate);
    return [d3.min(launchDates), d3.max(launchDates)];
  }, [props.allSatellites]);

  const changeSelectedRange = () => {
    const newFilter = props.filterSettings.update({
      // TODO: replace hard-coded values with user selection
      minDate: props.filterSettings.filter.minDate ? undefined : new Date('2000-01-01'),
      maxDate: props.filterSettings.filter.minDate ? undefined : new Date('2020-12-31'),
    });
    props.onUpdateFilter(newFilter);
  };

  const currentFilter = props.filterSettings.filter;
  const minDate = currentFilter.minDate || datasetMinDate;
  const maxDate = currentFilter.maxDate || datasetMaxDate;

  return (
    <div className="Timeline">
      Placeholder: Timeline from
      <span> {minDate?.toISOString()?.substring(0, 10) || 'unknown'} </span>
      till
      <span> {maxDate?.toISOString()?.substring(0, 10) || 'unknown'}</span>.
      <br />
      <button type="button" onClick={changeSelectedRange}>TEST: Click to change filter</button>
    </div>
  );
}
