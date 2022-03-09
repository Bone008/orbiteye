import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { DefaultValues } from '../util/util';
import { Feature } from 'geojson';
import { WorldMapJSON } from "../model/data_loader";
import { fromIsoA3ToSatCat } from '../model/mapping';
import { FilterSettings, SetFilterCallback } from '../model/filter_settings';

export interface WorldMapProps {
  filteredSatellites: Satellite[],
  onUpdateFilter: SetFilterCallback;
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

  const height = 250
  const width = 500
  const marginLeft = -10
  const marginTop = 15
  const legendWidth = 15
  const legendHeight = 200

  useEffect(() => {
    // Quickfix: Reset the first time this is opened.
    props.onUpdateFilter(new FilterSettings({}));
  }, []);

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement>(null!);
  const svgRef2 = useRef<SVGSVGElement>(null!);

  // Projector to Lat/Long to Mercator
  const mapProjection = props.projection
    .scale(width / (2.5 * Math.PI))
    .rotate([0, 0])
    .center([0, 0])
    .translate([width / 2, height / 2]);

  // Projections path generator
  const pathGenerator = d3.geoPath().projection(mapProjection);

  const tooltip = d3.select('body')
    .append('div')
    .attr('height', 0)
    .attr('width', 0)
    .attr('id', 'tooltip')

  function updateMap() {
    //Computing the number of satellite per country within the filtered satellites dataset
    const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner);

    const array = Array.from(nbSatellitePerCountry)
    const max = d3.max(array, d => d[1]) as number
    const min = d3.min(array, d => d[1]) as number

    // Color scale
    const colorScale =/*  d3.scaleLog<string>() */
      d3.scaleLinear<string>()
      .range(["lightgreen", "darkgreen"])
        .domain([min, max])

    // Mouse over -> tooltip appears and opacity changes on the country
    function mouseOver(e: any, d: any) {
      const satCatCode = d.properties?.iso_a3;
      var nbSat = nbSatellitePerCountry.get(fromIsoA3ToSatCat[satCatCode])
      if (!nbSat) nbSat = 0
      tooltip
        .transition()
        .duration(2000)
        .style('opacity', 1)
        .text(d.properties?.name + ": " + nbSat + " satellite(s) with selected filters.")

      d3.select(e.srcElement)
        .style("opacity", .8)
        .style("stroke", "black")
    }

    // Mouse move -> tooltip moves
    function mouseMove(e: any) {
      tooltip
        .style('left', (e.pageX + 10) + 'px')
        .style('top', (e.pageY + 10) + 'px')
        .style('opacity', 1)
        .transition()
        .duration(1000)
    }

    // Mouse over -> tooltip disappears and opacity changes back to normal on the country
    function mouseOut(e: any) {
      tooltip
        .style('opacity', 0)
        .attr('height', 0)
        .attr('width', 0)

      d3.select(e.srcElement)
        .style("opacity", 1)
        .style("stroke", "grey")
    }

    // Color countries with the color scale, and in grey if unknown
    function colorCountry(d: any) {
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

    // Map d3 with update
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

    // Updates if filters change
    groupMap.exit().remove()

    // Set up zoom and panning
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 4])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', e => {
        d3.select(svgRef.current).selectAll('g')
          .attr('transform', e.transform);
      });

    d3.select(svgRef.current)
      .call(zoom);


    const mapLegend = d3.select(svgRef2.current)
      .select("g.mapLegend")
      .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

    const legendStep = 10
    const h = (max - min) / 10

    // Legend title
    mapLegend.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - ((legendStep - 1) * 15) / 2 - 8)
      .attr("y", -3)
      .style("text-anchor", "middle")
      .text("Number of satellite")
      .style("fill", "white");

    //const legendArray = [min, (max - min) / 2, max]
    const legendArray = Array((legendStep + 1))

    const groupLegend = mapLegend
      .selectAll('rect')
      .data(legendArray)

    // Legend d3 with update
    groupLegend
      .enter()
      .append("rect")
      .merge(groupLegend as any)
      .transition()
      .duration(800)
      .attr("rx", 3)
      .attr("ry", 3)
      .style("fill", function (_, i) {
        if (!i) return 'lightgrey';
        return colorScale(min + Math.floor(i * h));
      })
      .attr("y", function (_, i) { return i * 15; })
      .attr('width', 15)
      .attr('height', 15)

    // Legend updates if filters change
    groupLegend.exit().remove()


    const mapLegendText = d3.select(svgRef2.current)
      .select("g.mapLegendText")
      .attr("transform", "translate(" + (marginLeft + 17) + "," + (marginTop + 13) + ")");

    const groupLegendText = mapLegendText
      .selectAll('text')
      .data(legendArray)

    // Legend text D3 with updates
    groupLegendText
      .enter()
      .append("text")
      .merge(groupLegendText as any)
      .text((_, i) => {
        if (!(i * h) && i != 0) return "";
        if (!i) return '0';
        return (min + Math.floor(i * h))
      })
      .transition()
      .duration(800)
      .attr("y", function (d, i) { return i * 15; })
      .style("fill", "white");

    // Legend text changes if filters change
    groupLegendText.exit().remove()
  }

  // Render/update world map
  useEffect(() => {
    updateMap()
  }, [props.filteredSatellites, props.worldJson.features, mapProjection]);

  return (
    <div className="WorldMap">
      <div>
        <svg ref={svgRef}
          viewBox={`0 0 ${width}, ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="WorldMap" style={{ backgroundColor: "lightblue", padding: "0" }}
        >
          <g className="mapLayer"></g>
        </svg>
      </div>
      <div>
        <svg ref={svgRef2}
          viewBox={`0 0 ${legendWidth}, ${legendHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="legendContainer"
        >
          <g className="mapLegend"></g>
          <g className="mapLegendText"></g>
        </svg>
      </div>

    </div>

  );
}
