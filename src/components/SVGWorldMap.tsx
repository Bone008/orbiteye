import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { DefaultValues } from '../util/util';
import { Feature } from 'geojson';
import { WorldMapJSON } from "../model/data_loader";
import { fromIsoA3ToSatCat } from '../model/mapping';
import { FilterSettings, SetFilterCallback } from '../model/filter_settings';
import LegendMap from './LegendMap';

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
  const width = 600

  const assoWidth = 170
  const assoHeight = 20

  const onUpdateFilter = props.onUpdateFilter;
  useEffect(() => {
    // Quickfix: Reset the first time this is opened.
    onUpdateFilter(new FilterSettings({}));
  }, [onUpdateFilter]);

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement>(null!);
  const svgRef3 = useRef<SVGSVGElement>(null!);

  // Projector to Lat/Long to Mercator
  const mapProjection = props.projection
    .scale(width / (2.5 * Math.PI))
    .rotate([0, 0])
    .center([0, 0])
    .translate([width / 2, height / 2]);

  // Projections path generator
  const pathGenerator = d3.geoPath().projection(mapProjection);

  const tooltip = d3.select('#tooltip')

  const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner);

  const array = Array.from(nbSatellitePerCountry)
  const max = d3.max(array, d => d[1]) as number
  const min = d3.min(array, d => d[1]) as number

  // Color scale
  const colorScale = d3.scaleLinear<string>()
    .range(["lightgreen", "green", "darkgreen", "orange"])
    // More dynamic in low numbers
    .domain([min, min + (max - min) / 15, min + (max - min) / 2, max])


  // Render/update world map
  useEffect(() => {

    tooltip
      .style('opacity', 0)
      .style('left', '10000px')

    //Computing the number of satellite per country within the filtered satellites dataset
    //const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => 1), d => d.owner);

  /*     const array = Array.from(nbSatellitePerCountry)
      const max = d3.max(array, d => d[1]) as number
      const min = d3.min(array, d => d[1]) as number
  
      // Color scale
      const colorScale = d3.scaleLinear<string>()
          .range(["lightgreen", "green", "darkgreen", "orange"])
          // More dynamic in low numbers
          .domain([min, min + (max - min) / 15, min + (max - min) / 2, max]) */

    // Mouse over -> tooltip appears and opacity changes on the country
    function mouseOver(e: any, d: any) {
      const satCatCode = d.properties?.iso_a3;
      var nbSat = nbSatellitePerCountry.get(fromIsoA3ToSatCat[satCatCode])
      if (!nbSat) nbSat = 0
      tooltip
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
    }

    // Mouse over -> tooltip disappears and opacity changes back to normal on the country
    function mouseOut(e: any) {
      tooltip
        .text('')
        .style('opacity', 0)
        .style('left', '10000px')

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

    const mapLayer = d3.select(svgRef.current).select("g.mapLayer")
      //.attr("transform", "translate(10, -20)")

    // Creating the path to make the map
    const groupMap = mapLayer.selectAll("path")
      .data(props.worldJson?.features as Feature[])

    // Map d3 with update
    groupMap
      .join('path')
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

   /*  const mapLegend = d3.select(svgRef2.current)
      .select("g.mapLegend")

    const legendStep = 9
    const h = (max - min) / 10
    const legendArray = Array((legendStep + 2))
    const sizeRect = 15

    // Legend title
    mapLegend.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - legendHeight / 2)
      .attr("y", -3)
      .style("text-anchor", "middle")
      .text("Number of satellite")
      .style("fill", "white");

    const groupLegend = mapLegend
      .selectAll('rect')
      .data(legendArray)

    // Legend d3 with update
    groupLegend
      .join('rect')
      .transition()
      .duration(800)
      .style("fill", function (_, i) {
        if (!i) return 'lightgrey';
        return colorScale(min + Math.floor(i * h));
      })
      .attr("y", function (_, i) { return 7.5 + i * sizeRect; })
      .attr('width', sizeRect)
      .attr('height', sizeRect)

    const mapLegendText = d3.select(svgRef2.current)
      .select("g.mapLegendText")

    const groupLegendText = mapLegendText
      .selectAll('text')
      .data(legendArray)

    // Legend text D3 with updates
    groupLegendText
      .join('text')
      .text((_, i) => {
        if (!(i * h) && i != 0) return "";
        if (!i) return '0';
        return (min + Math.floor(i * h))
      })
      .transition()
      .duration(800)
      .attr("y", function (_, i) { return 20.5 + i * sizeRect }) //Don't get why 13 (+ 7.5)
      .attr("x", sizeRect + 2)
      .style("fill", "white"); */


    // Mouse over -> tooltip appears and opacity changes on the country
    function mouseOver2(e: any, d: any) {
      var nbSat = nbSatellitePerCountry.get(d)
      if (!nbSat) nbSat = 0
      tooltip
        .style('opacity', 1)
        .text(d + ": " + nbSat + " satellite(s) with selected filters.")

      d3.select(e.srcElement)
        .style("opacity", .8)
        .style("stroke", "black")
    }

    // Mouse move -> tooltip moves
    function mouseMove2(e: any) {
      /*       console.log(e.pageX, window.innerWidth / 2)
      
            if (e.pageX > window.innerWidth / 2) {
              console.log("right")
              tooltip
                .style('left', (e.pageX - 100) + 'px')
                .style('top', (e.pageY - 100) + 'px')
                .style('opacity', 0.5)
            } */
      tooltip
        .style('left', (e.pageX + 10) + 'px')
        .style('top', (e.pageY - 100) + 'px')
        .style('opacity', 1)

    }

    // Mouse over -> tooltip disappears and opacity changes back to normal on the country
    function mouseOut2(e: any) {
      tooltip
        .text('')
        .style('opacity', 0)
        .style('left', '10000px')

      d3.select(e.srcElement)
        .style("opacity", 1)
        .style("stroke", "grey")
    }
    const assoMap = d3.select(svgRef3.current)
      .select("g.assoMap")

    //const countArray = new Array(29)
    const countArray = ["AB", "ABS", "AC", "CHBZ"
      , "ESA", "ESRO", "EUME", "EUTE", "AB", "ABS"
      , "ESA", "ESRO", "EUME", "EUTE", "AB", "ABS"
      , "ESA", "ESRO", "AB", "ABS", "AC", "CHBZ"
      , "ESA", "ESRO", "EUME", "EUTE", "AB", "ABS"
      , "ESA"]

    const sizeCircle = 3
    const marginBetweenCircles = (assoWidth - countArray.length * sizeCircle * 2) / (countArray.length + 1)

    assoMap
      .append("text")
      .attr("x", assoWidth / 2)
      .attr("y", 4)
      .style("text-anchor", "middle")
      .style("font-size", sizeCircle)
      .text("Union of countries")
      .style("fill", "white");

    const groupAssoMap = assoMap
      .selectAll('path')
      .data(countArray)

    const radialLineGenerator = d3.lineRadial();

    const radialpoints = [
      [0, sizeCircle],
      [Math.PI * 0.4, sizeCircle],
      [Math.PI * 0.8, sizeCircle],
      [Math.PI * 1.2, sizeCircle],
      [Math.PI * 1.6, sizeCircle],
      [Math.PI * 2, sizeCircle]
    ];

    const radialData = radialLineGenerator(radialpoints as any);

    groupAssoMap
      .join('path')
      .attr("stroke", "grey")
      .attr("stroke-width", "0.1px")
      .on('mouseover', mouseOver2)
      .on('mousemove', mouseMove2)
      .on('mouseout', mouseOut2)
      .attr('d', radialData)
      .transition()
      .duration(800)
      .style("fill", (d, _) => {
        const countOfSatellite = nbSatellitePerCountry.get(d)

        // If undefined/unknown, we put it in grey
        if (!countOfSatellite) return "lightgrey"

        // Otherwise we put it in a color scale
        return colorScale(countOfSatellite)
      })
      .attr("transform", function (_, i) {
        if (i % 2) return "translate(" + (sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles)) + "," + 15 + ")"
        return "translate(" + (sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles)) + "," + 10 + ")"
      });

    // Legend d3 with update
    /* groupAssoMap
      //.join('circle')
      .join('rect')
      .attr("stroke", "grey")
      .attr("stroke-width", "0.1px")
      .on('mouseover', mouseOver2)
      .on('mousemove', mouseMove2)
      .on('mouseout', mouseOut2)
      .transition()
      .duration(800)
      .style("fill", (d, _) => {
        const countOfSatellite = nbSatellitePerCountry.get(d)

        // If undefined/unknown, we put it in grey
        if (!countOfSatellite) return "lightgrey"

        // Otherwise we put it in a color scale
        return colorScale(countOfSatellite)
      })
      .attr("y", function (_, i) {
        if (i % 2) return 15
        return 10
      })
      .attr("x", function (_, i) {
        return sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles);
      })
      .attr('width', 2 * sizeCircle)
      .attr('height', 2 * sizeCircle)
      .attr("r", sizeCircle) */

  }, [props.filteredSatellites, props.worldJson.features, mapProjection, colorScale, nbSatellitePerCountry, pathGenerator, tooltip]);

  return (
    <div className="WorldMap" style={{ padding: "0", background: "lightblue" }}>
      <div id="tooltip"></div>
      <div>
        <svg ref={svgRef}
          viewBox={`10 10 ${width}, ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="WorldMap" style={{ backgroundColor: "lightblue", padding: "0" }}
        >
          <g className="mapLayer"></g>
        </svg>
      </div>
      <LegendMap satelliteNumber={nbSatellitePerCountry} width={15} height={180} colorScale={colorScale} max={max} min={min}></LegendMap>
      <div className="assoMapContainer">
        <svg ref={svgRef3}
          viewBox={`0 0 ${assoWidth}, ${assoHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="assoMap"></g>
        </svg>
      </div>
    </div>
  );
}
