import './WorldMap.css';
import { Satellite } from '../model/satellite';

export interface WorldMapProps {
  filteredSatellites: Satellite[];
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(props: WorldMapProps) {
  return (
    <div className="WorldMap">
      Placeholder: WorldMap using {props.filteredSatellites.length} satellites.
    </div>
  );
}
