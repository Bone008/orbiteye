import './ViewOptionsGrid.css'

import { ReactElement, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

// TODO: add prop for "collapsible" which is used in landing page
//  and disables ability to collapse menu. Also starts menu expanded.

export interface ViewOptionsGridProps {
  view: ReactElement,
}

export default function ViewOptionsGrid(props: ViewOptionsGridProps) {
  const ref = useRef<HTMLDivElement>(null!);

  const collapse = () => {
    ref.current.classList.remove("expand")
    ref.current.querySelectorAll(".nav, .desc").forEach(e => e.classList.remove("expand"))
  }

  const expand = () => {
    ref.current.classList.add("expand")
    ref.current.querySelectorAll(".nav, .desc").forEach(e => e.classList.add("expand"))
  }

  const optionBlocks = viewOptions.map(opt => {
    return (
      <Link key={opt.name + "_block"} className="item desc" to={opt.href} onClick={collapse}>
        <div className="optionContainer">
          <p className="optionTitle">{opt.name}</p>
          <p className="optionDescription">{opt.description}</p>
        </div>
      </Link>
    );
  });

  const optionTabs = viewOptions.map(opt => {
    return (
      <Link key={opt.name + "_tab"} className="item nav" to={opt.href} onClick={collapse}> {opt.name} </Link>
    );
  });

  return (
    <div ref={ref} className="grid">
      {optionBlocks.slice(0, 2)}
      <div className="item"></div>
      <div className="item"></div>
      <div className="item"></div>
      {optionBlocks.slice(2, 4)}
      <div className="item"></div>
      <div className="item"></div>
      <div className="item"></div>
      <div className="item desc" onClick={collapse} style={{ gridColumn: "1/5" }}><ChevronUpIcon /></div>
      <div className="item"></div>
      {optionTabs}
      <div className="item nav" onClick={expand}> <ChevronDownIcon /> </div>
      <div className="item" style={{ gridColumn: "1/6" }}>
        {props.view}
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