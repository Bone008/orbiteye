import './WorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { groundTraceSync } from '../util/orbits';

export interface WorldMapProps {
  filteredSatellites: Satellite[];
  width: number,
  height: number,
  traceLimit?: number,
}

const defaultProps: Partial<WorldMapProps> = {
  traceLimit: 10,
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(props: WorldMapProps) {
  props = { ...defaultProps, ...props }; // Use defaults where necessary

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Projector to Lat/Long to Mercator
  const mapProjection = d3.geoMercator()
    .scale(props.width / 2.5 / Math.PI)
    .rotate([0, 0])
    .center([0, 0])
    .translate([props.width / 2, props.height / 2]);


  // Render world map (runs just once)
  useEffect(() => {
    const mapLayer = d3.select(svgRef.current).select("g.mapLayer");

    // Projections path generator
    const pathGenerator = d3.geoPath().projection(mapProjection);

    // Loading the world map
    fetch('data/world.json').then(resp => {
      resp.json().then(json => {

        // Creating the path to make the map
        mapLayer.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", function (d: any) { return pathGenerator(d) })
          .attr("stroke", "grey")
          .attr("stroke-width", "1px")
          .attr("fill", "burlywood")
      });
    });

  }, [mapProjection]);


  // D3 logic goes here and will run anytime an item in the second argument is modified (shallow comparison)
  useEffect(() => {
    const traceLayer = d3.select(svgRef.current).select("g.traceLayer");

    // Reset the container
    traceLayer.selectAll("*").remove();

    // Filter to satellites with orbital data
    const satellites = props.filteredSatellites.filter(sat => !!sat.tle).slice(0, props.traceLimit);


    // Calculate all traces
    traceLayer.selectAll("path")
      .data(satellites)
      .enter().append("path")
      .attr("d", sat => {
        const trace: [number, number][] = groundTraceSync(sat).map(lngLat => [lngLat[0], lngLat[1]]);
        const lineGen = d3.line()
          .x(p => p[0])
          .y(p => p[1])
        return lineGen(trace.map(p => mapProjection(p) || [Infinity, Infinity]));
      })
      .attr("fill", "none")
      .attr("stroke", "red") // TODO: base on something else
      .on('mouseover', d => {
        d3.select(d.srcElement).attr("stroke-width", "10px");
      })
      .on('mouseout', d => {
        d3.select(d.srcElement).attr("stroke-width", "1px");
      })

  }, [props.filteredSatellites, props.traceLimit, mapProjection]);

  // Set up zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([1, 4])
    .translateExtent([[0, 0], [props.width, props.height]])
    .on('zoom', e => {
      d3.select(svgRef.current).selectAll('g')
        .attr('transform', e.transform);
    });

  d3.select(svgRef.current)
    .call(zoom as any);


  return (
    <div className="WorldMap">
      <svg ref={svgRef}
        width={props.width}
        height={props.height}
        viewBox={`0 0 ${props.width}, ${props.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="WorldMap" style={{ backgroundColor: "lightblue", padding: "0" }}
      >
        <g className="mapLayer"></g>
        <g className="traceLayer"></g>
      </svg>
    </div>
  );
}
