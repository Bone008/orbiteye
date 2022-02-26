import './ViewOptionsGrid.css'

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

export default function GridTest(props: any) {
  const ref = useRef<HTMLDivElement>(null!);

  const collapse = () => {
    ref.current.classList.remove("expand")
    ref.current.querySelectorAll(".nav, .desc").forEach(e => e.classList.remove("expand"))
  }

  const expand = () => {
    ref.current.classList.add("expand")
    ref.current.querySelectorAll(".nav, .desc").forEach(e => e.classList.add("expand"))
  }

  return (
    <div ref={ref} className="grid">
      <Link className="item desc" to='/orbits/globe' onClick={collapse}>Orbits Expand</Link>
      <Link className="item desc" to='/orbits/map' onClick={collapse}>Orbits (2D) Expand</Link>
      <div className="item"></div>
      <div className="item"></div>
      <div className="item"></div>
      <Link className="item desc" to='/' onClick={collapse}>Origin Expand</Link>
      <Link className="item desc" to='/' onClick={collapse}>Decay Expand</Link>
      <div className="item"></div>
      <div className="item"></div>
      <div className="item"></div>
      <div className="item desc" onClick={collapse} style={{ gridColumn: "1/5" }}><ChevronUpIcon /></div>
      <div className="item"></div>
      <Link className="item nav" to='/orbits/globe'>Orbits</Link>
      <Link className="item nav" to='/orbits/map'>Orbits (2D)</Link>
      <Link className="item nav" to='/'>Origin</Link>
      <Link className="item nav" to='/'>Decay</Link>
      <div className="item nav" onClick={expand}> <ChevronDownIcon /> </div>
      <div className="item" style={{ gridColumn: "1/6" }}>
        {props.view}
      </div>
    </div>
  );
}