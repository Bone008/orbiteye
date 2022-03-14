import './StaticWorldMap.css';
import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Satellite } from '../model/satellite';
import { groundTraceSync } from '../util/orbits';
import { DefaultValues } from '../util/util';
import { COLOR_PALETTE_ORBITS } from '../util/colors';
import { smartSampleSatellites } from '../util/sampling';
import Legend from './Legend';

import WorldMapImg from '../assets/NASA-Visible-Earth-September-2004.jpg';

const GEO_BOX_THRESHOLD = 2.5;
const GEO_BOX_SIZE = 5; // Add small buffer for visual appeal

export interface StaticWorldMapProps {
  filteredSatellites: Satellite[];
  selectedSatellite: Satellite | null;
  setSelectedSatellite: (newSatellite: Satellite | null) => void;

  width: number,
  height: number,
  traceLimit?: number,
}

const defaultProps: DefaultValues<StaticWorldMapProps> = {
  traceLimit: 20,
}

/** React component to render 2D world map with visualizations on top. */
export default function WorldMap(__props: StaticWorldMapProps) {
  const props = { ...defaultProps, ...__props } as Required<StaticWorldMapProps>; // Use defaults where necessary

  // Reference to the main SVG element
  const svgRef = useRef<SVGSVGElement>(null!);

  // Projector to Lat/Long to equirectangular to match NASA image
  const mapProjection = d3.geoEquirectangular()
    .scale(props.width / (2 * Math.PI))
    .translate([props.width / 2, props.height / 2]);

  // Render world map (runs just once)
  useEffect(() => {
    const mapLayer = d3.select(svgRef.current).select("g.mapLayer");
    mapLayer.selectAll("*").remove();
    mapLayer.append("svg:image")
      .attr("href", WorldMapImg)
      .attr("width", props.width)
      .attr("height", props.height);
  }, [props.width, props.height]);


  // Filter to satellites with orbital data
  const shownSatellites = useMemo(
    () => smartSampleSatellites(props.filteredSatellites.filter(sat => !!sat.tle), props.traceLimit),
    [props.filteredSatellites, props.traceLimit]
  );

  // D3 logic goes here and will run anytime an item in the second argument is modified (shallow comparison)
  const selectedSatellite = props.selectedSatellite;
  const setSelectedSatellite = props.setSelectedSatellite;
  useEffect(() => {
    const traceLayer = d3.select(svgRef.current).select("g.traceLayer").selectAll("path")
      .data(shownSatellites);

    // Reset the container
    //traceLayer.selectAll("*").remove();

    // Calculate all traces
    traceLayer
      /*       .enter()
            .append("path")
            .merge(traceLayer as any) */
      .join("path")
      .attr("fill", "none")
      .attr("stroke", sat => sat === selectedSatellite ? "white" : COLOR_PALETTE_ORBITS[sat.orbitClass] || 'gray')
      .attr("stroke-width", sat => sat === selectedSatellite ? "2px" : "1px")
      .attr("stroke-linecap", "round")
      .on('mouseover', (e, sat) => {
        if (sat !== selectedSatellite) {
          d3.select(e.srcElement).attr("stroke-width", "2px");
        }
      })
      .on('mouseout', (e, d) => {
        if (d !== selectedSatellite) {
          d3.select(e.srcElement).attr("stroke-width", "1px");
        }
      })
      .on('click', (e: MouseEvent, sat) => {
        e.stopPropagation();
        setSelectedSatellite(sat);
      })
      .attr("d", (sat, i) => {
        const trace: [number, number][] = groundTraceSync(sat).map(lngLat => [lngLat[0], lngLat[1]]);
        const lineGen = d3.line()
          .x(p => p[0])
          .y(p => p[1]);

        let pointsStr = lineGen(trace.map(p => mapProjection(p) || [Infinity, Infinity]));

        // Special case for geosynchronous: Draw box around the position.
        if (sat.orbitClass === 'GEO') {
          // Calculate bounding box
          const longs = trace.map(p => p[0]);
          const lats = trace.map(p => p[1]);

          const longMinMax: [number, number] = [Math.min(...longs), Math.max(...longs)];
          const latMinMax: [number, number] = [Math.min(...lats), Math.max(...lats)];

          if (longMinMax[1] - longMinMax[0] < GEO_BOX_THRESHOLD && latMinMax[1] - latMinMax[0] < GEO_BOX_THRESHOLD) {
            const avgLong = (longMinMax[1] + longMinMax[0]) / 2;
            const avgLat = (latMinMax[1] + latMinMax[0]) / 2;
            const [px, py] = mapProjection([avgLong, avgLat]) || [Infinity, Infinity];

            const s = GEO_BOX_SIZE;
            // SVG path instructions can just be concatenated
            pointsStr += lineGen([[px - s, py - s], [px + s, py - s], [px + s, py + s], [px - s, py + s], [px - s, py - s]])!;
          }
        }
        return pointsStr;
      })


    //traceLayer.exit().remove()

  }, [props.filteredSatellites, selectedSatellite, setSelectedSatellite, props.traceLimit, mapProjection, shownSatellites]);

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
    <div className="WorldMap" style={{ padding: "0" }}>
      <svg ref={svgRef}
        //width={props.width}
        //height={props.height}
        viewBox={`0 0 ${500}, ${250}`}
        preserveAspectRatio="xMidYMid meet"
        className="WorldMap"
        style={{ padding: "0" }}
        onClick={e => props.setSelectedSatellite(null)}
      >
        <g className="mapLayer"></g>
        <g className="traceLayer"></g>
      </svg>
      <Legend type="orbitTypes" />
      {/*<Legend type="switch2d3d" />*/}
      <Legend type="warnShowingLimited" numShown={shownSatellites.length} numTotal={props.filteredSatellites.length} orbitLimit={props.traceLimit} />
    </div>
  );
}
