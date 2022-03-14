import './ViewContainer.css';

import { useRef } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { BarChartIcon, ChevronDownIcon, ChevronUpIcon, GlobeIcon, MapIcon } from './Icons';
import GlobeView from './GlobeView';
import StaticWorldMap from './StaticWorldMap';
import SVGWorldMap from './SVGWorldMap';
import { Satellite } from '../model/satellite';
import { WorldMapJSON } from '../model/data_loader';
import { SetFilterCallback } from '../model/filter_settings';

export interface ViewContainerProps {
  filteredSatellites: Satellite[];
  onUpdateFilter: SetFilterCallback;
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

  const optionBlocks = viewOptions.map((opt, i) => {
    // Set up background image
    const backgroundImg = "__" + opt.name.replace(' ', '') + "_img";

    const stretchLast: boolean = viewOptions.length % 2 === 1 && i === viewOptions.length - 1;
    const style: React.CSSProperties = stretchLast ? { gridColumn: "1/3" } : {};

    return (
      <NavLink
        key={opt.name + "_block"}
        className={({ isActive }) => `optionBlock ${backgroundImg}` + (isActive ? ' selected' : '')}
        to={opt.href}
        onClick={showBot}
        style={style}
      >
        <div className="optionContainer">
          <p className="optionTitle">
            {opt.icon({ width: 21, height: 21, className: 'icon' })}
            {opt.name}
          </p>
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
        {opt.icon({ width: 21, height: 21, className: 'icon' })}
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
        <div style={{ minWidth: 0, minHeight: 0, backgroundColor: "black" }}>
          <Routes>
            <Route path="/" element={null} />
            <Route path="/orbits" element={<Navigate to="/orbits/globe" replace />} />
            <Route path="/orbits/globe" element={<GlobeView {...props} />} />
            <Route path="/orbits/map" element={<StaticWorldMap {...props} width={500} height={250} />} />
            <Route path="/origins" element={<SVGWorldMap filteredSatellites={props.filteredSatellites} onUpdateFilter={props.onUpdateFilter} worldJson={props.worldJson} width={500} height={250} />} />

            {/* For unmatched paths, give ViewNotFound */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}


interface ViewOption {
  name: string;
  icon: typeof GlobeIcon;
  description: string;
  href: string;
}

// NOTE: This isn't too extensible! The layout above and in the CSS is built for either 2 or 4 options total
const viewOptions: ViewOption[] = [
  {
    name: "Orbits",
    icon: GlobeIcon,
    description: "Examine the path of different orbit types around the Earth in 3D space.",
    href: "/orbits/globe",
  },
  {
    name: "Ground Tracks",
    icon: MapIcon,
    description: "See what parts of the Earth different orbit types cover on the world map.",
    href: "/orbits/map",
  },
  {
    name: "Origins",
    icon: BarChartIcon,
    description: "Learn about which countries are the most active in the satellite space. Filter over time to see how global interest in space has evolved.",
    href: "/origins",
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