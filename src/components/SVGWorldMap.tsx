import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { DefaultValues } from '../util/optional_props';
import { Feature } from 'geojson';
import { WorldMapJSON } from "../model/data_loader";
import { fromIsoA3ToSatCat } from '../model/mapping';

export interface WorldMapProps {
  filteredSatellites: Satellite[],
  worldJson: WorldMapJSON,
  width: number,
  height: number,
  traceLimit?: number,
  projection?: d3.GeoProjection
}

const defaultProps: DefaultValues<WorldMapProps> = {
  traceLimit: 10,
  projection: d3.geoEqualEarth(),
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(reqProps: WorldMapProps) {
  const props = { ...defaultProps, ...reqProps } as Required<WorldMapProps>; // Use defaults where necessary

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement>(null!);
  /*   const test = document.getElementById('test')?.offsetHeight
    const test2 = document.getElementById('test')?.clientHeight
    console.log(test, test2, window.innerHeight) */

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
  const colorScale = d3.scaleLog<string>()
    .range(["lightgreen", "green"])
    .domain([1, 100])

  function updateMap() {
    //Computing the number of satellite per country within the filtered satellites dataset
    const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner);

    // Creating the path to make the map
    const groupMap = mapLayer.selectAll("path")
      .data(props.worldJson?.features as Feature[])

    groupMap
      .enter()
      .append('path')
      .merge(groupMap as any)  //TODO: I don't get this type, maybe problem between TypeScript and D3
      .attr("d", d => pathGenerator(d))
      .attr("stroke", "grey")
      .attr("stroke-width", "1px")
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
      .transition()
      .duration(1000)
      .attr("fill", d => {
        const satCatCode = d.properties?.iso_a3;
        const countOfSatellite = nbSatellitePerCountry.get(fromIsoA3ToSatCat[satCatCode])

        // If undefined/unknown, we put it in grey
        if (!countOfSatellite) return "lightgrey"

        // Otherwise we put it in a color scale TODO check with mapping
        return colorScale(countOfSatellite)
      })
    groupMap.exit().remove()
  }

  // Render/update world map
  useEffect(() => {
    updateMap()
  }, [props.filteredSatellites, props.worldJson.features, mapProjection]);

  // Set up zoom and panning
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 4])
    .translateExtent([[0, 0], [props.width, props.height]])
    .on('zoom', e => {
      d3.select(svgRef.current).selectAll('g')
        .attr('transform', e.transform);
    });

  d3.select(svgRef.current)
    .call(zoom);

  return (
    <div className="WorldMap" style={{ backgroundColor: "black", padding: "0" }}>
      <svg ref={svgRef}
        viewBox={`0 0 ${props.width}, ${props.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="WorldMap" style={{ backgroundColor: "lightblue", padding: "0" }}
        //style={{ width: "100%", paddingBottom: "92%", height: "1px", overflow: "visible", backgroundColor: "transparent" }}
      >
        <g className="mapLayer"></g>

      </svg>
    </div>
  );
}
