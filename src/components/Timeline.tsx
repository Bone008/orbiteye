import './Timeline.css';
import React, { useState } from 'react';
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
  // Test code to demonstrate how state hooks work.
  // Feel free to remove once implementing the actual timeline.
  const [count, setCount] = useState(1);
  const increment = () => setCount(count + count);

  const changeSelectedRange = () => {
    // TODO: populate new filter
    props.onUpdateFilter(new FilterSettings());
  };

  const launchDates = props.allSatellites.map(sat => sat.launchDate);
  const minDate = d3.min(launchDates);
  const maxDate = d3.max(launchDates);

  return (
    <div className="Timeline">
      Placeholder: Timeline from
      <span> {minDate?.toDateString() || 'unknown'} </span>
      till
      <span> {maxDate?.toDateString() || 'unknown'}</span>.
      <span
        onMouseOver={increment}
        onMouseOut={increment}> [hover to change: {count}]</span>
      <button type="button" onClick={changeSelectedRange}>TEST: Click to change filter</button>
    </div>
  );
}
