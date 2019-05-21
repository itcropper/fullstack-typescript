import React, { Component } from 'react';
import "normalize.css";
import "../styles/BarChart.css";
import axios from 'axios';
import * as d3 from "d3";
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import { select } from 'd3-selection';

export interface IBarChartInputs {
   data: string;
   size: number[];
 }

class BarChart extends Component<IBarChartInputs> {

    private myRef;
    private node;
    private margin: number; 

    constructor(props){
        super(props);
        this.createBarChart = this.createBarChart.bind(this);
        this.myRef = React.createRef();
        this.node = this.myRef.current;
        this.margin = 20;
     }
     componentDidMount() {
        this.getData(
           this.props.data, 
           this.createBarChart
         );
     }
     componentDidUpdate() {
        //this.createBarChart()
     }

     getData(url, cb){
        d3.csv(this.props.data).then((res) => {
           //console.log(res);
           cb(res);
        });
      // axios.get(url).then((res) => {
      //    console.log(res.data.stationBeanList);
      //    var data = d3.nest()
      //    .key((d:any) => { return new Date(d.lastCommunicationTime).toString().split('-').slice(0, 2).join('-'); })
      //    .rollup((values: any) =>  {
            
      //       return values;
      //       // var cities = {};
      //       // values.forEach(element => {
      //       //    if(cities[element.city]){
      //       //       cities[element.cities].availableDocks += element.availableDocks;
      //       //    }else{
      //       //       cities[element.cities] = d3.sum(values, (d:any) => d.availableDocks);
      //       //    }
      //       // });
      //       // return cities;
      //    })
      //    .entries(res.data.stationBeanList);

      //    console.log(data);
      // })
     }

     createBarChart(data: any[]) {

      data = data.map(d => {
         return Object.assign(d, {
            total: ((Number(d.Black) || 0) + 
            (Number(d.White) || 0) +
            (Number(d.Other) || 0))
         })
      })

      const node = this.node || {};

      const yScale = scaleLinear()
         .domain([0, d3.max(data, d => d.total)])
         .range([0, this.props.size[1] - 20]);

      const xScale = scaleLinear()
         .domain([0, data.length])
         .range([0, this.props.size[0]]);

      select(node)
         .selectAll('rect')
         .data(data)
         .enter()
         .append('rect')
         .attr('class', 'bar')
         .attr("y", (d: any) =>this.props.size[1])
         .attr('height',0)
         .attr('width', this.props.size[0] / data.length)
         .attr('transform', (d,i) => {
            return `translate(${[this.props.size[0] / data.length * i, 0]})`
         })
         .transition()
         .duration(1500)//time in ms
         .attr('height', (d: any) => yScale(d.total))
         .attr("y", (d: any) =>this.props.size[1] - yScale(d.total))
 

      select(node)
         .selectAll('text')
         .data(data)
         .enter()
         .append('text')
         .attr('fill', "white")
         .attr('width', (d:any, i: any) => (this.props.size[0]) / data.length + 5)
         .text((d:any) => `${d.total << 0}`)
         .attr("y", (d: any) => this.props.size[1] - yScale(d.total) + 15)
         .attr("x", (d:any, i: any) => (this.props.size[0] * i) / data.length + 5)
         //.attr('transform', (d: any) => `rotate(-20) translate(0,${d.total})`)




      select(node).append("g")
         .attr("transform", `translate(0,${this.props.size[1]})`)
         .call(d3.axisBottom(xScale));
     }

  
  render() {
        return <svg 
            ref={node => this.node = node}
            width={this.props.size[0]} 
            height={this.props.size[1]}
            >
        </svg>
     }
}

export default BarChart;