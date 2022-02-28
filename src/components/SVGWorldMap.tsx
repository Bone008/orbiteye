import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { groundTraceSync } from '../util/orbits';
import { DefaultValues } from '../util/optional_props';

export interface WorldMapProps {
  filteredSatellites: Satellite[];
  width: number,
  height: number,
  traceLimit?: number,
  projection?: d3.GeoProjection
}

const defaultProps: DefaultValues<WorldMapProps> = {
  traceLimit: 10,
  projection: d3.geoMercator(),
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(reqProps: WorldMapProps) {
  const props = { ...defaultProps, ...reqProps } as Required<WorldMapProps>; // Use defaults where necessary

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement>(null!);

  // Projector to Lat/Long to Mercator
  const mapProjection = props.projection
    .scale(props.width / (2.5 * Math.PI))
    .rotate([0, 0])
    .center([0, 0])
    .translate([props.width / 2, props.height / 2]);

  const mapLayer = d3.select(svgRef.current).select("g.mapLayer");

  // Projections path generator
  const pathGenerator = d3.geoPath().projection(mapProjection);

  //Color scale
  const colorScale = d3.scaleLog()
    .range(["lightgreen", "green"] as Iterable<number>)
    .domain([1, 100])

  // Render world map (runs just once)
  useEffect(() => {
    // Loading the world map
    fetch('data/world.json').then(resp => {
      resp.json().then(json => {

        //Computing the number of satellite per country within the filtered satellites dataset
        var nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner)

        // Creating the path to make the map
        var groupMap = mapLayer.selectAll("path")
          .data(json.features)

        groupMap
          .enter()
          .append('path')
          .merge(groupMap as any)
          .transition()
          .duration(600)
          .attr("d", function (d: any) { return pathGenerator(d) })
          .attr("stroke", "grey")
          .attr("stroke-width", "1px")
          .attr("fill", function (d: any) {
            //If undefined/unknown, we put it in grey
            if (!nbSatellitePerCountry.get(d.properties.ISO_A3)) return "lightgrey"
            //console.log("data", nbSatellitePerCountry.get(d.properties.ISO_A3), d.properties.ISO_A3)

            //Otherwise we put it in a color scale TODO check with mapping
            return colorScale(nbSatellitePerCountry.get(d.properties.ISO_A3) as number)
          })
          //Some mouse interactions
          .on('mouseover', function (d: any) {
            d3.select(d.srcElement)
              .style("opacity", .8)
              .style("stroke", "black")
          })
          .on('mouseout', function (d: any) {
            d3.select(d.srcElement)
              .style("opacity", 1)
              .style("stroke", "grey")
          })

        //For updating
        groupMap.exit().remove()
      });
    });

  }, [props.filteredSatellites, mapProjection]);

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
      .enter()
      .append("path")
      .attr("d", sat => {
        const trace: [number, number][] = groundTraceSync(sat).map(lngLat => [lngLat[0], lngLat[1]]);
        const lineGen = d3.line()
          .x(p => p[0])
          .y(p => p[1])
        return lineGen(trace.map(p => mapProjection(p) || [Infinity, Infinity]));
      })
      .attr("fill", "none")
      .attr("stroke", "red") // TODO: base on something else
      .attr("stroke-width", "1px")
      .attr("border-width", "2px")
      .attr("border-color", "blue")
      .on('mouseover', d => {
        d3.select(d.srcElement)
          .style("stroke-width", "10px");
      })
      .on('mouseout', d => {
        d3.select(d.srcElement)
          .style("stroke-width", "1px");
      })

  }, [props.filteredSatellites, props.traceLimit, mapProjection]);

  // Set up zoom and panning
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
