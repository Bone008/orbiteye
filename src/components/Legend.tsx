import './Legend.css'

import { COLOR_PALETTE_ORBITS } from "../util/colors";

export interface LegendProps {
  type: "orbitTypes"; // Can be extended with more types of legends in the future.
}

export default function Legend(props: LegendProps) {
  return <OrbitTypesLegend />;
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
