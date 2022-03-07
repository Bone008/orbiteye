import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
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


  // Projections path generator
  const pathGenerator = d3.geoPath().projection(mapProjection);

  //Color scale
  const colorScale = d3.scaleLog<string>()
    .range(["lightgreen", "green"])
    .domain([1, 100])

  const tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')

  function updateMap() {
    //Computing the number of satellite per country within the filtered satellites dataset
    const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner);

    function mouseOver(e: any, d: any) {
      const satCatCode = d.properties?.iso_a3;
      var nbSat = nbSatellitePerCountry.get(fromIsoA3ToSatCat[satCatCode])
      if (!nbSat) nbSat = 0
      tooltip
        .transition()
        .duration(2000)
        .style('opacity', 1)
        .text(d.properties?.name + ": " + nbSat + " satellites with selected filters.")

      d3.select(e.srcElement)
        .style("opacity", .8)
        .style("stroke", "black")
    }

    function mouseMove(e: any) {
      tooltip
        .style('left', (e.pageX + 10) + 'px')
        .style('top', (e.pageY + 10) + 'px')
        .style('opacity', 1)
        .transition()
        .duration(1000)
    }

    function mouseOut(e: any) {
      tooltip
        .style('opacity', 0)

      d3.select(e.srcElement)
        .style("opacity", 1)
        .style("stroke", "grey")
    }

    function colorCountry(d: any) {
      //console.log("1", d.properties?.iso_a3)
      const satCatCode = d.properties?.iso_a3;
      const countOfSatellite = nbSatellitePerCountry.get(fromIsoA3ToSatCat[satCatCode])

      // If undefined/unknown, we put it in grey
      if (!countOfSatellite) return "lightgrey"

      // Otherwise we put it in a color scale
      return colorScale(countOfSatellite)
    }

    const mapLayer = d3.select(svgRef.current).select("g.mapLayer");

    // Creating the path to make the map
    const groupMap = mapLayer.selectAll("path")
      .data(props.worldJson?.features as Feature[])

    groupMap
      .enter()
      .append('path')
      .merge(groupMap as any)  //TODO: I don't get this type, maybe problem between TypeScript and D3
      .attr("d", d => pathGenerator(d))
      .attr("stroke", "grey")
      .attr("stroke-width", "0.1px")
      // Some mouse interactions
      .on('mouseover', mouseOver)
      .on('mousemove', mouseMove)
      .on('mouseout', mouseOut)
      .transition()
      .duration(800)
      .attr("fill", colorCountry)

    groupMap.exit().remove()
  }

  // Render/update world map
  useEffect(() => {
    updateMap()
    console.log("test", props.filteredSatellites, props.worldJson.features)
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
        viewBox={`0 0 ${props.width}, ${props.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="WorldMap" style={{ backgroundColor: "lightblue", padding: "0" }}
      >
        <g className="mapLayer"></g>

      </svg>
    </div>
  );
}
