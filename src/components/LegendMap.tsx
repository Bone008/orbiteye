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

  // Main update function
  useEffect(() => {
    const mapLegend = d3.select(svgRef.current)
      .select("g.mapLegend")

    const margin = 10
    const deltah = props.max - props.min

    const colorScale = d3.scaleLinear<string>() ///CHange scale color / round number
      //.range(["darkblue", "green", "lightgreen", "orange", "darkblue", "green", "lightgreen", "orange", "yellow"])
      .range(["#2c7bb6", "#00a6ca", "#00ccbc", "#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"])
      // More dynamic in low numbers
      .domain([props.min, props.min + deltah * 0.125, props.min + deltah * 0.25, props.min + deltah * 0.375, props.min + deltah * 0.5, props.min + deltah * 0.625, props.min + deltah * 0.75, props.min + deltah * 0.875, props.max])


    const legendStep = 50
    const h = deltah / (legendStep + 1)
    const legendArray = Array((legendStep + 2))
    const sizeRect = (props.height - 4 * margin) / (legendStep + 1)

    // Legend title
    mapLegend.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", margin - props.height / 2)
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
        return colorScale(props.min + Math.floor(i * h));

      })
      .attr("y", function (_, i) {
        return margin + i * sizeRect;
      })
      .attr('width', 10)
      .attr('height', sizeRect)

    mapLegend
      .append('rect')
      .style("fill", "lightgrey")
      .attr("width", 10)
      .attr("height", margin)
      .attr("y", 3 * margin + legendStep * sizeRect)
      .attr("x", -23)

    const mapLegendText = d3.select(svgRef.current)
      .select("g.mapLegendText")

    const groupLegendText = mapLegendText
      .selectAll('text')
      .data(legendArray)

    function roundNumber(nb: number) {
      if (nb > 1000) {
        return Math.round(nb / 1000) * 1000
      } else if (nb > 100) {
        return Math.round(nb / 100) * 100
      } else if (nb > 10) {
        return Math.round(nb / 10) * 10
      }
      return nb
    }

    // Legend text D3 with updates
    groupLegendText
      .join('text')
      .text((_, i) => {
        if (!(i * h) && i !== 0) return "";
        if (!i) return '0';
        if (i % 10 === 5) return roundNumber(props.min + Math.floor(i * h))
        if (i === legendStep) return props.max
        return ""//(props.min + Math.floor(i * h))
      })
      .transition()
      .duration(800)
      .attr("y", function (_, i) { return 20.5 + i * sizeRect }) //Don't get why 13 (+ 7.5)
      .attr("x", 10 + 2)
      .style("fill", "white");

    mapLegendText
      .append('text')
      .text('No data')
      .style("fill", "white")
      .attr("y", 4 * margin + legendStep * sizeRect)
      .attr("x", 2 - 13)

  }, [props]);

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