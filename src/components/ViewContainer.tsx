import { HashRouter, Route, Routes } from "react-router-dom";
import { Satellite } from "../model/satellite";
import GlobeView from "./GlobeView";
import StaticWorldMap from "./StaticWorldMap";
import SVGWorldMap from './SVGWorldMap';
import ViewSelector from "./ViewSelector";

export interface ViewContainerProps {
  filteredSatellites: Satellite[],
}

export default function ViewContainer(props: ViewContainerProps) {
  const filteredSatellites = props.filteredSatellites;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ViewSelector view={<ViewNotFound />} />} />
        <Route path="/orbits/globe" element={<ViewSelector view={<GlobeView filteredSatellites={filteredSatellites} />} />} />
        <Route path="/orbits/map" element={<ViewSelector view={<StaticWorldMap filteredSatellites={filteredSatellites} width={500} height={250} />} />} />
        <Route path="/origin" element={<ViewSelector view={<SVGWorldMap filteredSatellites={filteredSatellites} width={500} height={250} />} />} />

        {/* For unmatched paths, give ViewNotFound */}
        <Route path="*" element={<ViewSelector view={<ViewNotFound />} />} />
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