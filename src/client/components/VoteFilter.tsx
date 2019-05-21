import React, { Component } from 'react';
import "normalize.css";
import "../styles/votingList.css";
import axios from 'axios';
import * as d3 from "d3";
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import { Button, MenuItem, InputGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select"
import { LARGE } from '@blueprintjs/core/lib/esm/common/classes';


interface IVoteFilterProps {
    onChange: (e:any) => void;
}

export default class VotingList extends Component<IVoteFilterProps> {

    public state: {value: string};

    constructor(props){
        super(props);

        this.state = {
            value: ""
        }

       // this.handleFilterChange = this.handleFilterChange.bind(this);
    }


    // handleFilterChange(e) {

    //     this.setState({
    //         value: e.currentTarget.value
    //     });
    // }

    render() {
        return (<InputGroup
            large={true}
            leftIcon="filter"
            onChange={this.props.onChange}
            placeholder="Filter votes..."
            // rightElement={maybeSpinner}
            // small={small}
            // value={filterValue}
        />);
    }
}