import React, { Component } from 'react';
import "normalize.css";
import "../styles/senateMap.css";
import * as d3 from "d3";
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import { select } from 'd3-selection';
import { DescribeKeyPairsRequest } from 'aws-sdk/clients/ec2';
import { Desk, PartyColor } from '../utils/SenateDesk';
import {IVoteResult} from "./SenateVoting";


export interface ISenateMapProps {
    votingLines:{ vote: IVoteResult, lis: string }[]
}

class SenateMap extends Component<ISenateMapProps>{

    private myRef;
    private node;
    private margin: number; 
    private div;

    private desks: Desk[];

    constructor(props){
        super(props);

        this.createChart = this.createChart.bind(this);
        this.myRef = React.createRef();
        this.node = this.myRef.current;

    }

    componentDidMount(){
        this.div = select(this.node.parentNode).append("div")	
        .attr("class", "senate-map-tooltip")				
        .style("opacity", 0);

        this.getData(
            this.createChart
          );
    }
    handleMouseOver(seat: Desk){

        var name = seat.name.split(', ').reverse().join(' '),
            voteStatus = seat.voteStatus != "" ? `<p>Vote: ${seat.voteStatus}` : "",
            html = `<p>${name}</p>
                ${voteStatus}
                <div class="mug-container">
                <img class="mug-shot" src="https://theunitedstates.io/images/congress/225x275/${seat.bioguide}.jpg" />
        </div>`
            
        this.div.transition()		
            .duration(200)		
            .style("opacity", .9);
        this.div.html(html)	
            .style("left", (d3.event.x) + "px")		
            .style("top", (d3.event.y - 28) + "px");	
                    
    }
        
    handleMouseMove(){
        this.div.style("left", (d3.event.x) + "px")		
        .style("top", (d3.event.y - 28) + "px");	
    }
        
    handleMouseOut(e){
        this.div.transition()		
        .duration(200)		
        .style("opacity", 0);	
    }

    createChart(data: Desk[]){
        const node = this.node || {};

        let deskvg = select(node)
        .selectAll('desk')
        .data(data)
        .enter()
        .append('circle')
        .attr('id', d => d.lis)
        .attr('class', "desk")
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        
        .attr('stroke', d => d.fill())
        .attr('stroke-width', ".5px")
        .attr("transform", "translate(500,150)")
        .on("mouseover", this.handleMouseOver.bind(this))
        .on('mousemove', this.handleMouseMove.bind(this))
        .on("mouseout",  this.handleMouseOut.bind(this))
        .attr('fill', d => d.fill())


        //deskvg.exit().remove();
        

      
    //   deskEnter.append('text')
    //     .text(d => d.deskNumber)
    //     .attr("transform", "translate(500,150)")
    //     .attr('x', d => d.x - 5).attr('y', d => d.y + 3)
    //     .attr('font-size', d => 12 * d.r / 20 + 6);

    }

    updateColors(data: Desk[]){
        const node = this.node || {};

        for(var d of data){
            select(node)
            .select("#" + d.lis)
            .transition().duration(1000)
            // .attr('stroke', d => d.stroke())
            .attr('fill', d.fill());
        }


    }


    getData(cb){
        d3.json('https://theunitedstates.io/congress-legislators/legislators-current.json').then((res:any[]) => {
           //console.log(res);
           

           this.desks = this.desks.map(d => {
            let name = d.name.replace(",", '').split(' '),
                fname = name[1], lname=name[0],
                legis = res.filter(c => { 
                  
                  return (c.name.official_full.indexOf(fname) > -1 && 
                            c.name.official_full.indexOf(lname) > -1) ||
                         (c.id.ballotpedia && c.id.ballotpedia.indexOf(fname) > -1 && 
                          c.id.ballotpedia.indexOf(lname) > -1)
                  })[0];
            d.meta = legis;
            d.lis = legis.id.lis;
            d.bioguide = legis.id.bioguide;
            d.state = legis.terms[legis.terms.length - 1].state;
            d.party = legis.terms[legis.terms.length - 1].party;
    
            return d;
          });

          cb(this.desks);

        });

    }

    spaceAndSizeDesks(desks){
        var rowi = 1;
        var sectioni = 1;
        var seati = 1;
        var starting = 37;
        var allotment = (360 / 10) / desks.length; 
        var sectionPadding = 3;

        desks.reverse();
        desks.forEach(section => {
            section.forEach(row => {
                row.reverse();
            });
        });

        for(var section of desks){
            var sectionWidth = 360 / 10 - 1;
            for(var row of section){
                var allotment = sectionWidth / row.length; 
                var centerOfSection = starting + sectioni * section + sectionWidth / 2;
                for(var seat of row){
                    seat.row = rowi;
                    seat.angle(allotment * seati + starting + sectioni * sectionWidth );
                    seati++;
                }
                seati = 1;
                rowi++;
            }
            rowi = 1;
            sectioni++;
        }

        return desks.flat(3);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.votingLines && nextProps.votingLines.length){
           
            let d: { vote_id: IVoteResult, lis: string };
            for(d of nextProps.votingLines){
                let legis = this.desks.filter(m => m.lis == d.lis)[0];
                if(legis != undefined){
                    if(d.vote_id == IVoteResult.nay){
                        legis.fill(PartyColor.nay)
                        legis.voteStatus = "Nay";
                    }else if(d.vote_id == IVoteResult.yea){
                        legis.fill(PartyColor.yeah);
                        legis.voteStatus = "Yea";
                    }else if(d.vote_id == IVoteResult.none){
                        legis.fill(PartyColor.abstain);
                        legis.voteStatus = "Abstain";
                    }else{
                        legis.voteStatus = "Absent";
                    }
                }
            }
        }
        this.updateColors(this.desks);
    }

    componentWillMount() {

        this.desks = [];



        var desks = [
            [
                [
                    new Desk("Cortez Masto, Catherine", 62, 1, 280),
                    new Desk("Warren, Elizabeth", 83, 1, 270),
                    new Desk("Murphy, Christopher", 66, 1, 256),
                ],
                [
                    new Desk("Smith, Tina", 62, 2, 283),
                    new Desk("Hassan, Margaret Wood", 13, 2, 274),
                    new Desk("King, Angus", 57, 2, 265),
                    new Desk("Kaine, Tim", 96, 2, 256),
                ],
                [
                    new Desk("Sinema, Kyrsten", 25, 3, 283),
                    new Desk("Jones, Doug", 90, 3, 274),
                    new Desk("Van Hollen, Chris", 36, 3, 265),
                    new Desk("Peters, Gary", 14, 3, 256),
                ],
                [
                    new Desk("Rosen, Jacky", 94, 4, 283),
                    new Desk("Harris, Kamala", 97, 4, 274),
                    new Desk("Blumenthal, Richard", 63, 4, 265),
                    new Desk("Booker, Cory", 3, 4, 256),
                ]
            ],
            [
                [
                    new Desk("Stabenow, Debbie", 56, 1, 240),
                    new Desk("Menendez, Robert", 69, 1, 226),
                    new Desk("Reed, Jack", 89, 1, 214),
                ],
                [
                    new Desk("Manchin, Joe", 79, 2, 241),
                    new Desk("Baldwin, Tammy", 16, 2, 232),
                    new Desk("Sanders, Bernard", 43, 2, 223),
                    new Desk("Cardin, Ben", 51, 2, 243),
                ],
                [
                    new Desk("Hirono, Mazie", 71, 3, 243),
                    new Desk("Gillibrand, Kirsten", 87, 3, 236),
                    new Desk("Schatz, Brian", 33, 3, 229),
                    new Desk("Merkley, Jeff", 31, 3, 221.5),
                    new Desk("Carper, Thomas", 19, 3, 214),
                ],
                [
                    new Desk('Heinrich, Martin', 21, 4, 244),
                    new Desk('Whitehouse, Sheldon', 15, 4, 238),
                    new Desk('Duckworth, Tammy', 24, 4, 232),
                    new Desk('Bennet, Michael', 75, 4, 226),
                    new Desk('Warner, Mark', 18, 4, 220),
                    new Desk('Markey, Edward', 46, 4, 214),
                ],
            ],
            [
                [
                    new Desk("Durbin, Richard", 64, 1, 200),
                    new Desk("Schumer, Chuck", 10, 1, 184),
                ],
                [
                    new Desk("Leahy, Patrick", 67, 2, 203),
                    new Desk("Feinstein, Dianne", 5, 2, 193),
                    new Desk("Murray, Patty", 20, 2, 184),
                ],
                [
                    new Desk("Udall, Tom", 68, 3, 203.5),
                    new Desk("Shaheen, Jeanne", 29, 3, 197),
                    new Desk("Cantwell, Maria", 39, 3, 190.5),
                    new Desk("Wyden, Ron", 44, 3, 184),
                ],
                [
                    new Desk('Tester, Jon', 93, 4, 204.5),
                    new Desk('Coons, Christopher', 91, 4, 199.4),
                    new Desk('Klobuchar, Amy', 11, 4, 193.4),
                    new Desk('Casey, Robert', 99, 4, 189.2),
                    new Desk('Brown, Sherrod', 88, 4, 184),
                ],
            ],
            /* ----------------- REPUBLICANS ---------------*/
            [
                [
                    new Desk("McConnel, Mitch", 6, 1, 170),
                    new Desk("Thune, John", 65, 1, 154),
                ],
                [
                    new Desk('Shelby, Richard', 40, 2, 174),
                    new Desk('Roberts, Pat', 61, 2, 167.5),
                    new Desk('Murkowski, Lisa', 38, 2, 160.5),
                    new Desk('Collins, Susan', 27, 2, 154),
                ],
                [
                    new Desk('Enzi, Michael', 53, 3, 173.4),
                    new Desk('Wicker, Roger', 60, 3, 169.3),
                    new Desk('Blunt, Roy', 2, 3, 164.2),
                    new Desk('Risch, James', 50, 3, 159.1),
                    new Desk('Crapo, Mike', 74, 3, 154),
                ],
                [
        
                    new Desk('Tillis, Thom', 17, 4, 175.66),
                    new Desk('Young, Tod', 22, 4, 171.33),
                    new Desk('Gardner, Cory', 78, 4, 167),
                    new Desk('Rounds, Mike', 6, 4, 162.66),
                    new Desk('Capito, Shelley Moore', 1, 4, 158.33),
                    new Desk('Rubio, Marco', 95, 4, 154.3),
                ],
            ],
            [
                [
                    new Desk("Grassley, Chuck", 86, 1, 135),
                    new Desk('Inhofe, James', 49, 1, 115),
                ],
                [
                    new Desk("Cornyn, John", 41, 2, 137.5),
                    new Desk('Barrasso, John', 28, 2, 130),
                    new Desk('Graham, Lindsey', 59, 2, 122.5),
                    new Desk('Moran, Jerry', 100, 2, 115),
                ],
                [
                    new Desk('Hoeven, John', 45, 3, 139),
                    new Desk('Boozman, John', 23, 3, 133),
                    new Desk('Fischer, Deb', 81, 3, 127),
                    new Desk('Isakson, Johnny', 35, 3, 121),
                    new Desk('Burr, Richard', 47, 3, 115),
                ],
                [
                    new Desk('Cruz, Ted', 70, 4, 140),
                    new Desk('Perdue, David', 32, 4, 135),
                    new Desk('Cassidy, Bill', 26, 4, 130),
                    new Desk('Sasse, Ben', 85, 4, 125),
                    new Desk('Scott, Tim', 54, 4, 120),
                    new Desk('Portman, Rob', 77, 4, 115),
                ],
            ],
            [
                [
                    new Desk('Alexander, Lamar', 30, 1, 100),
                    new Desk('Lee, Mike', 42, 1, 91),
                    new Desk('Paul, Rand', 58, 1, 82),
                    new Desk('Kennedy, John', 34, 1, 73),
                ],
                [
                    new Desk('Lankford, James', 55, 2, 100),
                    new Desk('Daines, Steve', 52, 2, 91),
                    new Desk('Blackburn, Marsha', 76, 2, 82),
                    new Desk('Hyde-Smith, Cindy', 8, 2, 73),
                ],
                [
                    new Desk('Cotton, Tom', 48, 3, 102),
                    new Desk('Ernst, Joni', 92, 3, 94),
                    new Desk('McSally, Martha', 72, 3, 87),
                    new Desk('Hawley, Josh', 89, 3, 80),
                    new Desk('Scott, Rick', 7, 3, 73),
                ],
                [
                    new Desk('Toomey, Patrick', 80, 4, 103),
                    new Desk('Cramer, Kevin', 4, 4, 97),
                    new Desk('Johnson, Ron', 82, 4, 91),
                    new Desk('Sullivan, Dan', 73, 4, 85),
                    new Desk('Romney, Mitt', 37, 4, 79),
                    new Desk('Braun, Mike', 98, 4, 73),
                ]
            ]
        ];

        this.desks = this.spaceAndSizeDesks(desks);
    }

    render() {
        return (
        <svg 
            ref={node => this.node = node}
            width={1000} 
            height={600}
            >

        </svg>);
     }
}

export default SenateMap;