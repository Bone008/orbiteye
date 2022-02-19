import './WorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';

export interface WorldMapProps {
  filteredSatellites: Satellite[];
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(props: WorldMapProps) {

  // Setting up the svg element for D3 to draw in
  const w = window.innerWidth
  const h = window.innerHeight

  const svgRef = useRef<SVGSVGElement | null>(null);

  const mapProjection = d3.geoMercator()
    .scale(w / 2.5 / Math.PI)
    .rotate([0, 0])
    .center([0, 0])
    .translate([w / 2, h / 2]);

  const pathGenerator = d3.geoPath().projection(mapProjection)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("preserveAspectRatio", "xMidYMid meet")

    fetch('data/world.json').then(resp => {
      resp.json().then(json => {
        console.log(json.name);
        svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", function (d: any) { return pathGenerator(d) })
          .attr("stroke", "grey")
          .attr("fill", "white")
          .on('mouseover', (d) => {
            //console.log(d3.select(d.srcElement))
            d3.select(d.srcElement).attr("fill", "red")
            console.log(d.srcElement.__data__.properties.ADMIN)
          })
      });
    });
  }, []) 

  return (
    <div className="WorldMap">
      {/* Placeholder: WorldMap using {props.filteredSatellites.length} satellites. */}
      <svg ref={svgRef} height={h} width={w}></svg>
    </div>
  );
}
