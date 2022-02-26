import { HashRouter, Route, Routes } from "react-router-dom";
import { Satellite } from "../model/satellite";
import GlobeView from "./GlobeView";
import StaticWorldMap from "./StaticWorldMap";
import SVGWorldMap from './SVGWorldMap';
import ViewOptionsGrid from './ViewOptionsGrid';

export interface ViewContainerProps {
  filteredSatellites: Satellite[],
}

export default function ViewContainer(props: ViewContainerProps) {
  const filteredSatellites = props.filteredSatellites;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ViewOptionsGrid view={<ViewNotFound />} />} />
        <Route path="/orbits/globe" element={<ViewOptionsGrid view={<GlobeView filteredSatellites={filteredSatellites} />} />} />
        <Route path="/orbits/map" element={<ViewOptionsGrid view={<StaticWorldMap filteredSatellites={filteredSatellites} width={500} height={250} />} />} />
        <Route path="/origin" element={<ViewOptionsGrid view={<SVGWorldMap filteredSatellites={filteredSatellites} width={500} height={250} />} />} />

        {/* For unmatched paths, give ViewNotFound */}
        <Route path="*" element={<ViewOptionsGrid view={<ViewNotFound />} />} />
      </Routes>
    </HashRouter>
  );
}


function ViewNotFound() {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "gray", display: "flex" }}>
      {/* TODO: put something better here */}
      <p style={{ margin: "auto" }}> This view hasn't been implemented yet! </p>
    </div>
  );
}