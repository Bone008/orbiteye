import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Satellite } from "../model/satellite";
import { WorldMapJSON } from "../model/data_loader";
import GlobeView from "./GlobeView";
import StaticWorldMap from "./StaticWorldMap";
import SVGWorldMap from './SVGWorldMap';
import ViewSelector from "./ViewSelector";

export interface ViewContainerProps {
  filteredSatellites: Satellite[];
  selectedSatellite: Satellite | null;
  setSelectedSatellite: (newSatellite: Satellite | null) => void;
  worldJson: WorldMapJSON
}

export default function ViewContainer(props: ViewContainerProps) {
  const filteredSatellites = props.filteredSatellites;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ViewSelector />} />
        <Route path="/orbits/globe" element={<ViewSelector view={<GlobeView {...props} />} />} />
        <Route path="/orbits/map" element={<ViewSelector view={<StaticWorldMap {...props} width={500} height={250} />} />} />
        <Route path="/origin" element={<ViewSelector view={<SVGWorldMap filteredSatellites={filteredSatellites} worldJson={props.worldJson} width={500} height={250} />} />} />

        {/* For unmatched paths, give ViewNotFound */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}