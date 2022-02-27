import './ViewSelector.css';

import { ReactElement, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

export interface ViewControlsProps {
  view?: ReactElement
}

export default function ViewControls(props: ViewControlsProps) {
  const ref = useRef<HTMLDivElement>(null!);

  const showTop = () => {
    ref.current.querySelector(".optionBlockContainer")?.classList.remove("hidden");
    ref.current.querySelector(".optionTabsAndViewContainer")?.classList.add("hidden");
  }

  const showBot = () => {
    ref.current.querySelector(".optionBlockContainer")?.classList.add("hidden");
    ref.current.querySelector(".optionTabsAndViewContainer")?.classList.remove("hidden");
  }

  const optionBlocks = viewOptions.map(opt => {
    return (
      <Link key={opt.name + "_block"} className="optionBlock" to={opt.href} onClick={showBot}>
        <div className="optionContainer">
          <p className="optionTitle">{opt.name}</p>
          <p className="optionDescription">{opt.description}</p>
        </div>
      </Link>
    );
  });

  const optionTabs = viewOptions.map(opt => {
    return (
      <Link key={opt.name + "_tab"} className="optionTab" to={opt.href} onClick={showBot}> {opt.name} </Link>
    );
  });

  const wipeUpButton = !props.view ? null : <div className="wipeUpButton" onClick={showBot}><ChevronUpIcon /></div>;

  return (
    <div ref={ref} className="wipeContainer">
      <div className={`wipe ${props.view ? "hidden" : "uncollapsible"} optionBlockContainer`}>
        {optionBlocks}
        {wipeUpButton}
      </div>
      <div className={`wipe ${props.view ? "" : "hidden"} optionTabsAndViewContainer`}>
        <div className='optionTabContainer'>
          {optionTabs}
          <div className="optionTab" onClick={showTop}><ChevronDownIcon /></div>
        </div>

        {/* Prevent grid blowout https://css-tricks.com/preventing-a-grid-blowout/ */}
        <div style={{ minWidth: 0, backgroundColor: "black" }}>
          {props.view}
        </div>
      </div>
    </div>
  );
}



// NOTE: This isn't too extensible! The layout above and in the CSS is built for 4 options total
const viewOptions = [
  {
    name: "Orbits",
    description: "In this mode, you will be able to see an overview of the different types of orbits and their satellites.",
    href: "/orbits/globe",
  },
  {
    name: "Orbits (2D)",
    description: "Temporary link until we implement switching within the view :)",
    href: "/orbits/map",
  },
  {
    name: "Origin",
    description: "In this mode, you will be able to see the most active countries in launching or active satellites throughout history.",
    href: "/origin",
  },
  // {
  //   name: "Launch",
  //   description: "In this mode, you will see all the launch sites used depending on their interests.",
  //   href: "/launch",
  // },
  {
    name: "Decay",
    description: "In this mode, you will be able to point out the increase of debris number over the years.",
    href: "/decay",
  },
];