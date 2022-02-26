import './ViewContainer.css'

import { HashRouter, Route, Routes } from "react-router-dom";
import { Satellite } from "../model/satellite";
import GlobeView from "./GlobeView";
import StaticWorldMap from "./StaticWorldMap";
import GridTest from './ViewOptionsGrid';

export interface ViewContainerProps {
  filteredSatellites: Satellite[],
}

export default function ViewContainer(props: ViewContainerProps) {
  const filteredSatellites = props.filteredSatellites;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GridTest view={<DeadView />} />} />
        <Route path="/orbits/globe" element={<GridTest view={<GlobeView filteredSatellites={filteredSatellites} />} />} />
        <Route path="/orbits/map" element={<GridTest view={<StaticWorldMap filteredSatellites={filteredSatellites} width={500} height={250} />} />} />
      </Routes>
    </HashRouter>
  );
}


function DeadView() {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "gray", display: "flex" }}>
      {/* TODO: put something better here */}
      <p style={{ margin: "auto" }}> Dead :( </p>
    </div>
  );
}

// const viewOptions = [
//   {
//     name: "Orbits",
//     description: "In this mode, you will be able to see an overview of the different types of orbits and their satellites.",
//     href: "/orbits/globe",
//   },
//   {
//     name: "Orbits (2D)",
//     description: "Temporary link until we implement switching within the view :)",
//     href: "/orbits/map",
//   },
//   {
//     name: "Origin",
//     description: "In this mode, you will be able to see the most active countries in launching or active satellites throughout history.",
//     href: "/origin",
//   },
//   {
//     name: "Launch",
//     description: "In this mode, you will see all the launch sites used depending on their interests.",
//     href: "/",
//   },
//   {
//     name: "Decay",
//     description: "In this mode, you will be able to point out the increase of debris number over the years.",
//     href: "/",
//   },
// ];