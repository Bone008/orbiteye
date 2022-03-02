import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { DefaultValues } from '../util/optional_props';
import { Feature } from 'geojson';

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

  // Color scale
  const colorScale = d3.scaleLog()
    .range(["lightgreen", "green"] as Iterable<number>)  //TODO: Why Iterable number
    .domain([1, 100])

  // Render world map
  useEffect(() => {
    // Loading the world map
    // TODO: probably shouldn't fetch on every single load -- instead fetch just once (maybe using useState?)
    fetch('data/world.json').then(resp => {
      resp.json().then(json => {

        //Computing the number of satellite per country within the filtered satellites dataset
        const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner);

        // Creating the path to make the map
        mapLayer.selectAll("*").remove();
        const groupMap = mapLayer.selectAll("path")
          .data(json.features as Feature[])

        groupMap
          .enter()
          .append('path')

          // Some mouse interactions
          .on('mouseover', e => {
            d3.select(e.srcElement)
              .style("opacity", .8)
              .style("stroke", "black")
          })
          .on('mouseout', e => {
            d3.select(e.srcElement)
              .style("opacity", 1)
              .style("stroke", "grey")
          })

          .transition()     // TODO: not working either. May be related to exit().remove() stuff
          .duration(600)
          .attr("d", d => pathGenerator(d))
          .attr("stroke", "grey")
          .attr("stroke-width", "1px")
          .attr("fill", d => {
            // If undefined/unknown, we put it in grey
            if (!nbSatellitePerCountry.get(d.properties?.ISO_A3)) return "lightgrey"
            //console.log("data", nbSatellitePerCountry.get(d.properties.ISO_A3), d.properties.ISO_A3)

            // Otherwise we put it in a color scale TODO check with mapping
            return colorScale(nbSatellitePerCountry.get(d.properties?.ISO_A3) as number)
          })


        // For updating
        // TODO: why is this not working? We shouldn't need to use selectAll("*").remove()
        // groupMap.exit().remove()
      });
    });

  }, [props.filteredSatellites, mapProjection]);

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
      </svg>
    </div>
  );
}
