import './SVGWorldMap.css';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { DefaultValues } from '../util/util';
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
  projection: d3.geoMercator(),
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(reqProps: WorldMapProps) {
  const props = { ...defaultProps, ...reqProps } as Required<WorldMapProps>; // Use defaults where necessary

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement>(null!);

  console.log(fromIsoA3ToSatCat.AZE)

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
    const groupMap = mapLayer.selectAll/* <SVGPathElement, Feature<Geometry, GeoJsonProperties>> */("path")
      .data(props.worldJson?.features as Feature[])

    groupMap.exit().remove()

    groupMap
      .enter()
      .append('path')
      .merge(groupMap as any)  //TODO: I don't get this type, maybe problem between TypeScript and D3

      .attr("d", d => pathGenerator(d))
      .attr("stroke", "grey")
      .attr("stroke-width", "1px")
      .attr("fill", d => {
        const satCatCode = d.properties?.iso_a3;
        const countOfSatellite = nbSatellitePerCountry.get(fromIsoA3ToSatCat[satCatCode])
        //const countOfSatellite = nbSatellitePerCountry.get(d.properties?.iso_a3)
        // If undefined/unknown, we put it in grey
        if (!countOfSatellite) return "lightgrey"
        //console.log("data", nbSatellitePerCountry.get(d.properties.ISO_A3), d.properties.ISO_A3)

        // Otherwise we put it in a color scale TODO check with mapping
        return colorScale(countOfSatellite)
      })
      // Some mouse interactions
      .on('mouseover', function (e: any) {
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
      .duration(600)

    groupMap.exit().remove()
  }

  // Render/update world map
  useEffect(() => {
    console.log("map", props.worldJson, props.filteredSatellites)
    updateMap()
    console.log("mapUp", props.worldJson, props.filteredSatellites)
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
