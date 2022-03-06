import './ViewContainer.css';

import { useRef } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';
import GlobeView from './GlobeView';
import StaticWorldMap from './StaticWorldMap';
import SVGWorldMap from './SVGWorldMap';
import { Satellite } from '../model/satellite';
import { WorldMapJSON } from '../model/data_loader';

export interface ViewContainerProps {
  filteredSatellites: Satellite[];
  selectedSatellite: Satellite | null;
  setSelectedSatellite: (newSatellite: Satellite | null) => void;
  worldJson: WorldMapJSON;
}

export default function ViewControls(props: ViewContainerProps) {
  const ref = useRef<HTMLDivElement>(null!);

  // Nav will be uncollapsible if on home page
  const isHomePage = useLocation().pathname === "/";

  const showTop = () => {
    ref.current.querySelector(".optionBlockContainer")?.classList.remove("hidden");
    ref.current.querySelector(".optionTabsAndViewContainer")?.classList.add("hidden");
  }

  const showBot = () => {
    ref.current.querySelector(".optionBlockContainer")?.classList.add("hidden");
    ref.current.querySelector(".optionTabsAndViewContainer")?.classList.remove("hidden");
  }

  const optionBlocks = viewOptions.map(opt => {
    // Set up background image
    const backgroundImg = "__" + opt.name + "_img"

    return (
      <NavLink
        key={opt.name + "_block"}
        className={({ isActive }) => `optionBlock ${backgroundImg}` + (isActive ? ' selected' : '')}
        to={opt.href}
        onClick={showBot}
        // style={style as React.CSSProperties}
      >
        <div className="optionContainer">
          <p className="optionTitle">{opt.name}</p>
          <p className="optionDescription">{opt.description}</p>
        </div>
      </NavLink>
    );
  });

  const optionTabs = viewOptions.map(opt => {
    return (
      <NavLink
        key={opt.name + "_tab"}
        className={({ isActive }) => "optionTab" + (isActive ? ' selected' : '')}
        to={opt.href}
        onClick={showBot}
      >
        {opt.name}
      </NavLink>
    );
  });


  // Default is a 2x2 + 1 layout meant for 4 options. Build in new possibility for 1x2 + 1 layout for 2 options
  let optionBlockContainerStyle: React.CSSProperties = {};
  let wipeUpButtonStyle: React.CSSProperties = {};
  if (viewOptions.length === 2) {
    optionBlockContainerStyle.gridTemplateColumns = "1fr";
    wipeUpButtonStyle.gridColumn = 1;
  }

  const wipeUpButton = isHomePage ? null : <div className="wipeUpButton" onClick={showBot} style={wipeUpButtonStyle}><ChevronUpIcon /></div>;

  return (
    <div ref={ref} className="wipeContainer">
      <div className={`wipe ${isHomePage ? "uncollapsible" : "hidden"} optionBlockContainer`} style={optionBlockContainerStyle}>
        {optionBlocks}
        {wipeUpButton}
      </div>
      <div className={`wipe ${isHomePage ? "hidden" : ""} optionTabsAndViewContainer`}>
        <div className='optionTabContainer'>
          {optionTabs}
          <div className="optionTab" onClick={showTop}><ChevronDownIcon /></div>
        </div>

        {/* Prevent grid blowout https://css-tricks.com/preventing-a-grid-blowout/ */}
        <div style={{ minWidth: 0, backgroundColor: "black" }}>
          <Routes>
            <Route path="/" element={null} />
            <Route path="/orbits" element={<Navigate to="/orbits/globe" replace />} />
            <Route path="/orbits/globe" element={<GlobeView {...props} />} />
            <Route path="/orbits/map" element={<StaticWorldMap {...props} width={500} height={250} />} />
            <Route path="/origin" element={<SVGWorldMap filteredSatellites={props.filteredSatellites} worldJson={props.worldJson} width={500} height={250} />} />

            <Route path="/launch" element={<h2 style={({ color: 'white' })}>TODO</h2>} />
            <Route path="/decay" element={<h2 style={({ color: 'white' })}>TODO</h2>} />

            {/* For unmatched paths, give ViewNotFound */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}



// NOTE: This isn't too extensible! The layout above and in the CSS is built for either 2 or 4 options total
const viewOptions = [
  {
    name: "Orbits",
    description: "See what different orbit types look like as they rotate around the Earth, as well as the ground tracks they make on the map.",
    href: "/orbits",
  },
  // {
  //   name: "Orbits2d",
  //   description: "Temporary link until we implement switching within the view :)",
  //   href: "/orbits/map",
  // },
  {
    name: "Origin",
    description: "Learn about which countries are the most active in the satellite space. Filter over time to see how global interest in space has evolved.",
    href: "/origin",
  },
  // {
  //   name: "Launch",
  //   description: "Examine the recent trend towards smaller research satellites in cheap orbits.",
  //   href: "/launch",
  // },
  // {
  //   name: "Decay",
  //   description: "Understand the growing problem of space debris often caused by decayed satellites.",
  //   href: "/decay",
  // },
];