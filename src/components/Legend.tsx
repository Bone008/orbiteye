import './Legend.css'

import { COLOR_PALETTE_ORBITS } from "../util/colors";
import { NavLink } from 'react-router-dom';
import { GlobeIcon, MapIcon } from './Icons';

export interface LegendProps {
  // Can be extended with more types of legends in the future.
  type: "orbitTypes" | "switch2d3d";
}

export default function Legend(props: LegendProps) {
  switch (props.type) {
    case "orbitTypes": return <OrbitTypesLegend />;
    case "switch2d3d": return <SwitchMode />;
  }
}

function OrbitTypesLegend(props: {}) {
  return (
    <div className="Legend">
      <div className="title">Orbit types</div>
      {Object.entries(COLOR_PALETTE_ORBITS).map(([name, color]) =>
        <div key={name} className="entry">
          <div className="entryColor" style={{ backgroundColor: color }}></div>
          <div className="entryLabel">{name}</div>
        </div>
      )}
    </div>
  );
}

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
