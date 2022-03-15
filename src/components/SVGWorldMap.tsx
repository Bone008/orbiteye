import './SVGWorldMap.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { DefaultValues } from '../util/util';
import { Feature } from 'geojson';
import { WorldMapJSON } from "../model/data_loader";
import { fromIsoA3ToSatCat, OWNER_SHORT_CODE_TO_FULL } from '../model/mapping';
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

  const height = 300
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

  //console.log(d3.rollup(props.filteredSatellites, v => d3.sum(v, d => d.launchMassKg), d => d.owner))
  //const nbSatellitePerCountry = d3.rollup(props.filteredSatellites, v => d3.sum(v, d => d.launchMassKg), d => d.owner);

  const array = Array.from(nbSatellitePerCountry)
  const max = d3.max(array, d => d[1]) as number
  const min = d3.min(array, d => d[1]) as number

  // Color scale
  const colorScale = d3.scaleLog<string>() ///CHange scale color / round number
    //.range(["darkblue", "green", "lightgreen", "orange", "darkblue", "green", "lightgreen", "orange", "yellow"])
    .range(["#2c7bb6", "#00a6ca", "#00ccbc", "#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"])
    // More dynamic in low numbers
    .domain([min, min + (max - min) * 0.125, min + (max - min) * 0.25, min + (max - min) * 0.375, min + (max - min) * 0.5, min + (max - min) * 0.625, min + (max - min) * 0.75, min + (max - min) * 0.875, max])


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
      if (!countOfSatellite && countOfSatellite !== 0) return "lightgrey"

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
      //.style("cursor", "pointer")
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

    // Mouse over -> tooltip appears and opacity changes on the country
    function mouseOver2(e: any, d: any) {
      var nbSat = nbSatellitePerCountry.get(d)
      if (!nbSat) nbSat = 0
      tooltip
        .style('opacity', 1)
        .text(OWNER_SHORT_CODE_TO_FULL[d] + ": " + nbSat + " satellite(s) with selected filters.")
    }

    // Mouse move -> tooltip moves
    function mouseMove2(e: any) {
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
    }
    const assoMap = d3.select(svgRef.current)
      .select("g.assoMap")

    //const countArray = new Array(29)
    const countArray = ["AB", "ABS", "AC", "CHBZ"
      , "ESA", "ESRO", "EUME", "EUTE", "FGER", "FRIT", "GLOB", "GRSA", "IM", "IRID"
      , "ISRO", "ISS", "ITSO", "NATO", "O3B", "ORB", "PRES", "RASC", "SEAL", "SES",
      "SGJP", "STCT", "TMMC", "USBZ"]

    const sizeCircle = 15
    const marginBetweenCircles = (width - 4 * sizeCircle - countArray.length * sizeCircle * 2) / (countArray.length + 1)

    const marginTop = 260;

    assoMap
      .append("text")
      .attr("x", width / 2)
      .attr("y", marginTop - sizeCircle - 5)
      .style("text-anchor", "middle")
      .style("font-size", 2 * sizeCircle / 3)
      .text("Partnerships / Collaborations")
      .style("fill", "white");

    const groupAssoMap = assoMap
      .selectAll('path')
      .data(countArray)

    const radialLineGenerator = d3.lineRadial();

    const radialpoints = [
      [0, sizeCircle],
      [Math.PI * 0.33, sizeCircle],
      [Math.PI * 0.66, sizeCircle],
      [Math.PI * 0.99, sizeCircle],
      [Math.PI * 1.33, sizeCircle],
      [Math.PI * 1.66, sizeCircle],
      [Math.PI * 2, sizeCircle]
    ];

    const radialData = radialLineGenerator(radialpoints as any);

    groupAssoMap
      .join('path')
      .attr("stroke", "grey")
      .attr("stroke-width", "0.1px")
      //.style("cursor", "pointer")
      .on('mouseover', (e, d) => {
        mouseOver2(e, d)
        d3.select(e.srcElement)
          .style("opacity", .8)
          .style("stroke", "black")
      })
      .on('mousemove', mouseMove2)
      .on('mouseout', (e, d) => {
        mouseOut2(e)
        d3.select(e.srcElement)
          .style("opacity", 1)
          .style("stroke", "grey")
      })
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
        if (i % 2) return "translate(" + (3 * sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles)) + "," + (marginTop + sizeCircle + 2 * sizeCircle / 3) + ")"
        //if (i % 3 == 1) return "translate(" + (sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles)) + "," + (marginTop + 13) + ")"
        return "translate(" + (3 * sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles)) + "," + marginTop + ")"
      });

    const groupAssoLabel = assoMap
      .selectAll('text')
      .data(countArray)

    groupAssoLabel
      .join('text')
      .style("text-anchor", "middle")
      .style("font-size", (2 * sizeCircle / 3 - 1) + 'px')
      .attr("class", "assoLabel")
      .attr('fill', "black")
      .style("cursor", "default")
      .on('mouseover', mouseOver2)
      .on('mousemove', mouseMove2)
      .on('mouseout', mouseOut2)
      .transition()
      .duration(800)
      .attr("x", function (_, i) {
        if (i % 2) return (3 * sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles))
        return (3 * sizeCircle + marginBetweenCircles + i * (sizeCircle * 2 + marginBetweenCircles))
      })
      .attr("y", function (_, i) {
        if (i % 2) return marginTop + sizeCircle + 2 * sizeCircle / 3 + sizeCircle / 4
        return marginTop + sizeCircle / 4
      })
      .text(d => d)

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
          viewBox={`0 0 ${width}, ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="WorldMap" style={{ backgroundColor: "lightblue", padding: "0" }}
        >
          <g className="mapLayer"></g>
          <g className="assoMap"></g>
        </svg>
      </div>
      <LegendMap satelliteNumber={nbSatellitePerCountry} width={15} height={180} colorScale={colorScale} max={max} min={min}></LegendMap>
      {/*       <div className="assoMapContainer">
        <svg ref={svgRef3}
          viewBox={`0 0 ${assoWidth}, ${assoHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="assoMap"></g>
        </svg>
      </div> */}
    </div>
  );
}
