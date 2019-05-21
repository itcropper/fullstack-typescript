import React, { Component } from 'react';
import "normalize.css";
import "../styles/votingList.css";
import axios from 'axios';
import * as d3 from "d3";
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select"

interface IVote {
    vote_number: string,
    vote_date: string,
    issue: string,
    question: string,
    result: string,
    vote_tally: {yeas:any[], nays: any[]}[],
    title: string,
    key: string;
}

interface IVotingListState {
    votingList: any[]
}

interface IVLProps {
    listOfVotes: any[],
    onChange: (e:any) => void,
}

const VoteSelect = Select.ofType<IVote>();



class VotingList extends Component<IVLProps> {

    private dataList: any[];
    private VoteSelect;

    public state: IVotingListState;

    private style: any  = {
        "width": "40vw",
        "maxHeight": "40vh",
        "overflowY": "auto",
        "marginBottom": "30px"
    }

    constructor(props:any){
        super(props);

        this.state = {
            votingList: []
        }

        //this.listClick = this.listClick.bind(this);
    }

    componentDidMount(){

    }

    listClick(data){

        this.props.onChange(data.key[0]);
    }

    render() {

        return (
            <ul style={this.style} className="voting-list">
                {
                    this.props.listOfVotes && this.props.listOfVotes.length ? this.props.listOfVotes.map((l, i) => {
                        let question = '';
                        if(typeof l.question[0] == "object"){
                            question = l.question[0]._;
                            //return null;
                        }else{
                            question = l.question[0];
                        }
                        return (<li key={i}>
                        <div onClick={this.listClick.bind(this, l)} data-vote_id={l.vote_number}>
                            <h5>Question: {question}</h5>
                            <p>{l.title[0]}</p>
                            <p>{l.vote_date[0]}</p>
                        </div>
                    </li>)
                    }) : []
                }
            </ul>
            // <select style={this.style} onChange={this.props.onChange}>
            //     {
            //         this.state.votingList.map(l => {
            //             return <option value={l.vote_number}>{l.title}</option>
            //         })
            //     }
            // </select>
        );
    }
}

export default VotingList;