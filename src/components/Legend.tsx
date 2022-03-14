import './Legend.css'

import { COLOR_PALETTE_ORBITS } from "../util/colors";
import { NavLink } from 'react-router-dom';
import { ExclamationTriangleFillIcon, GlobeIcon, MapIcon } from './Icons';
import { ORBIT_TYPE_CODE_TO_FULL_NAME } from '../model/mapping';

export type LegendProps =
  {
    type: "orbitTypes" | "switch2d3d"
  } |
  {
    type: "warnShowingLimited"
  } & WarnShowingLimitedProps;

export default function Legend(props: LegendProps) {
  switch (props.type) {
    case "orbitTypes": return <OrbitTypesLegend />;
    case "switch2d3d": return <SwitchMode />;
    case "warnShowingLimited": return <WarnShowingLimited {...props} />;
  }
}

function OrbitTypesLegend(props: {}) {
  return (
    <div className="Legend">
      <div className="title">Orbit types</div>
      {Object.entries(COLOR_PALETTE_ORBITS).map(([name, color]) =>
        <div key={name} className="entry">
          <div className="entryColor" style={{ backgroundColor: color }}></div>
          <div className="entryLabel">{ORBIT_TYPE_CODE_TO_FULL_NAME[name]}</div>
        </div>
      )}
    </div>
  );
}

/** Obsolete, has been replaced by a separate navigation tab as of 2022-03-16. */
function SwitchMode(props: {}) {
  return (
    <div className="SwitchMode">
      <NavLink to="/orbits/globe" className={({ isActive }) => "SwitchLink" + (isActive ? " selected" : "")}>
        <GlobeIcon className="icon" width="24" height="24" />
        <span>Globe</span>
      </NavLink>
      <NavLink to="/orbits/map" className={({ isActive }) => "SwitchLink" + (isActive ? " selected" : "")}>
        <MapIcon className="icon" width="24" height="24" />
        <span>Map</span>
      </NavLink>
    </div>
  );
}

export type WarnShowingLimitedProps = { numShown: number, numTotal: number, orbitLimit: number };
function WarnShowingLimited({ numShown, numTotal, orbitLimit }: WarnShowingLimitedProps) {
  if (numShown >= numTotal) {
    return null;
  }
  let reason: string;
  if (numShown < orbitLimit) {
    reason = 'because orbital parameters are not available for all satellites';
  } else {
    reason = 'to avoid overloading your browser';
  }

  return (
    <div className="WarnShowingLimited">
      <ExclamationTriangleFillIcon />
      <span>Showing only {numShown} of {numTotal} possible orbits {reason}.</span>
    </div>
  );
}
