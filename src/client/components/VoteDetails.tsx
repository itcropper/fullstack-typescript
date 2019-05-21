
import React, { Component } from 'react';
import "normalize.css";
import "../styles/senateMap.css";
import axios from 'axios';
import * as d3 from "d3";
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import { Button, MenuItem, Card } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select"


export interface IVoteDetailsProps {
    vote_id: string
}

interface IVoteDetailsState {
    vote_id: string;
    vote_details: {
        title?: string,
        details?: string,
        result?: string,
        yeas?: string,
        nays?: string
    }
}


export default class VoteDetails extends Component<IVoteDetailsProps>{

    public state: IVoteDetailsState;

    constructor(props){
        super(props);

        this.state = {
            vote_id: "00116",
            vote_details: {}
        };
    }

    componentDidUpdate(){
        if(this.props.vote_id != "" && this.props.vote_id != this.state.vote_id){
            var url = '/api/voteresults/' +(this.props.vote_id != "" ? this.props.vote_id : "00116");
            axios.get(url).then((data: any) => {
                data = data.data;
                this.setState({
                    vote_id: this.props.vote_id,
                    vote_details: {
                        title:   data.roll_call_vote.vote_question_text[0],
                        details: data.roll_call_vote.vote_title[0],
                        result:  data.roll_call_vote.vote_result[0],
                        yeas:    data.roll_call_vote.count[0].yeas[0],
                        nays:    data.roll_call_vote.count[0].nays[0],
                    }
                })
            });
        }
    }

    componentDidMount(){
        let url = '/api/voteresults/'+(this.props.vote_id || "00116");
        if(this.props.vote_id != ""){
            axios.get(url).then((data: any) => {
                data = data.data;
                var g = url;
                this.setState({
                    vote_id: this.props.vote_id,
                    vote_details: {
                        title:   data.roll_call_vote.vote_question_text[0],
                        details: data.roll_call_vote.vote_title[0],
                        result:  data.roll_call_vote.vote_result[0],
                        yeas:    data.roll_call_vote.count[0].yeas[0],
                        nays:    data.roll_call_vote.count[0].nays[0],
                    }
                })
            }); 
        }
    }

    render(){

        let card = <div></div>

        console.log(this.state.vote_details);

        if(this.state.vote_details.title){
            card = <Card>
                <h5>{this.state.vote_details.title}</h5>
                <p>{this.state.vote_details.details}</p>
                <p>Yeas: {this.state.vote_details.yeas}, Nays: {this.state.vote_details.nays}</p>
                <p><b>Result:</b> {this.state.vote_details.result}</p>

            </Card>
        }

        return (
            <div>
                {card}
            </div>
        );
    }
}