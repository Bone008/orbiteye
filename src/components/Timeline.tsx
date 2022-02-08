import './Timeline.css';
import React, { useState } from 'react';

export interface TimelineProps {
  minDate: Date;
  maxDate: Date;
}

/** React component to render the timeline and date range selection UI. */
export default function Timeline(props: TimelineProps) {
  // Test code to demonstrate how state hooks work.
  // Feel free to remove once implementing the actual timeline.
  const [count, setCount] = useState(1);
  const increment = () => setCount(count + count);

  return (
    <div className="Timeline">
      Placeholder: Timeline from
      <span> {props.minDate.toDateString()} </span>
      till
      <span> {props.maxDate.toDateString()}</span>.
      <span
        onMouseOver={increment}
        onMouseOut={increment}> [hover to change: {count}]</span>
    </div>
  );
}
