import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./LegendMap.css"

export type LegendProps = {
  satelliteNumber: d3.InternMap<string, number>,
  width: number,
  height: number,
  min: number,
  max: number,
  colorRange: string[],
  colorDomain: number[]
}

export default function LegendMap(props: LegendProps) {
  const svgRef = useRef<SVGSVGElement>(null!);

  // Main update function
  useEffect(() => {
    const mapLegend = d3.select(svgRef.current)
      .select("g.mapLegend")

    const margin = 10

    const colorScale = d3.scaleLinear<string>()
      .range(props.colorRange)
      // More dynamic in low numbers
      .domain(props.colorDomain)
      .nice()

    const marginLeft = 6
    const legendStep = 50
    const sizeRect = (props.height - 5 * margin) / (legendStep + 1)
    const colorbarHeight = margin + 145;

    mapLegend.selectAll("*").remove();

    const svgGradient = mapLegend.append('defs').append('linearGradient')
      .attr("id", "gradient-scale")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")

    svgGradient.selectAll("stop")
      .data(colorScale.range())
      .enter().append("stop")
      .attr("offset", (_, i) => i / (colorScale.range().length - 1))
      .attr("stop-color", d => d);

    mapLegend.append('rect')
      .attr("fill", "url(#gradient-scale)")
      .attr("x", 2 * marginLeft + 10)
      .attr("y", margin)
      .attr("width", 10)
      .attr("height", colorbarHeight)

    // Legend title
    mapLegend.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 1.4 * margin - props.height / 2)
      .attr("y", marginLeft + 10)
      .style("text-anchor", "middle")
      .text("Number of satellites")
      .style("fill", "white");

    mapLegend
      .append('rect')
      .style("fill", "lightgrey")
      .attr("width", 10)
      .attr("height", margin)
      .attr("y", 3 * margin + legendStep * sizeRect - 2) //changes location in the y axis of gray color square of 'No data' in the legend
      .attr("x", marginLeft) //changes location in x axis of gray color square of 'No data' in the legend

    const mapLegendText = d3.select(svgRef.current)
      .select("g.mapLegendText")

    const groupLegendText = mapLegendText
      .selectAll('text')
      .data(colorScale.ticks(5));

    // Legend text D3 with updates
    groupLegendText
      .join('text')
      .text(d => d)
      // TODO: The layout here is a bit broken I think. It seems to cause the legend ticks to not match the color 
      //  bar because they are in separate layers so their coordinates don't match up. Or maybe I just don't know
      //  what I'm doing :) I am using this clamp below to make it look nicer at the sacrifice of pure truth
      .attr("y", d => margin + clamp(getPercent(d, colorScale.domain()) * colorbarHeight, 10, colorbarHeight))
      .attr("x", 3 * marginLeft + 20)
      .style("fill", "white");

    mapLegendText
      .append('text')
      .text('No data')
      .style("fill", "white")
      .attr("y", 4 * margin + legendStep * sizeRect - 2)
      .attr("x", 2 * marginLeft + 10)

  }, [props]);

  return <div className="legendContainer">
    <svg ref={svgRef}
      viewBox={`0 0 ${props.width}, ${props.height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        width: "100%",
        height: "100%",
      }}
    >
      <g className="mapLegend"></g>
      <g className="mapLegendText"></g>
    </svg>
  </div>
}


function getPercent(x: number, domain: number[]) {
  const max = Math.max(...domain);
  const min = Math.min(...domain);
  return (x - min) / (max - min);
}

function clamp(x: number, min: number, max: number) {
  if (min > x) return min;
  if (max < x) return max;
  return x;
}