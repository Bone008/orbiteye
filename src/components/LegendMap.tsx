import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./LegendMap.css"

export type LegendProps =
  {
    satelliteNumber: d3.InternMap<string, number>,
    width: number,
    height: number,
    colorScale: d3.ScaleLinear<string, string>,
    min: number,
    max: number
  }

export default function LegendMap(props: LegendProps) {
  const svgRef = useRef<SVGSVGElement>(null!);

  function update() {
    const mapLegend = d3.select(svgRef.current)
      .select("g.mapLegend")

    /*     const array = Array.from(props.satelliteNumber)
        const max = d3.max(array, d => d[1]) as number
        const min = d3.min(array, d => d[1]) as number
     */
    /*     // Color scale
        const colorScale = d3.scaleLinear<string>()
          .range(["lightgreen", "green", "darkgreen", "orange"])
          // More dynamic in low numbers
          .domain([min, min + (max - min) / 15, min + (max - min) / 2, max]) */

    const legendStep = 9
    const h = (props.max - props.min) / 10
    const legendArray = Array((legendStep + 2))
    const sizeRect = 15

    // Legend title
    mapLegend.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - props.height / 2)
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
        return props.colorScale(props.min + Math.floor(i * h));
      })
      .attr("y", function (_, i) { return 7.5 + i * sizeRect; })
      .attr('width', sizeRect)
      .attr('height', sizeRect)

    const mapLegendText = d3.select(svgRef.current)
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
        return (props.min + Math.floor(i * h))
      })
      .transition()
      .duration(800)
      .attr("y", function (_, i) { return 20.5 + i * sizeRect }) //Don't get why 13 (+ 7.5)
      .attr("x", sizeRect + 2)
      .style("fill", "white");
  }

  useEffect(() => update(), [props.satelliteNumber])

  return <div className="legendContainer">
    <svg ref={svgRef}
      viewBox={`0 0 ${props.width}, ${props.height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        backgroundColor: "transparent",
        width: "100%",
        height: "100%",
      }}
    >
      <g className="mapLegend"></g>
      <g className="mapLegendText"></g>
    </svg>
  </div>


}