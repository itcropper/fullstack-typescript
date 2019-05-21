import React, { Component } from 'react';
import "normalize.css";
import axios from 'axios';
import SenateMap from "./senateMap";
import VotingList from "./VotingList";
import VoteDetails from "./VoteDetails";
import VoteFilter from "./VoteFilter";

export enum IVoteResult {
  none = "Not Voting",
  yea = "Yea",
  nay = "Nay"
}

interface ISenateVotingState {
  vote_id: string,
  voting_results: { vote: IVoteResult, lis: string }[],
  listOfVotes: any[]
}

class SenateVoting extends Component {

  public state:any;

  private style: any = {
    display: "flex",
    "alignItems": "start",
    width: "99vw",
    padding: "20px"
  };

  private listDetailStyling: any = {
    maxHeight: "40vh",
    overflow: "auto"
  }

  constructor(props){
    super(props);

    this.state = {
      vote_results: {},
      vote_id: "",
      listOfVotes: [],
      listOfVotesf: [],
    }

    this.updateMap = this.updateMap.bind(this);
    this.filterVotes = this.filterVotes.bind(this);
  }


  updateMap(e){

    let vote_id = e;


    this.setState({
      vote_id: vote_id
    });

    axios.get('/api/voteresults/'+vote_id).then((data: any) => {
      var votes = data.data.roll_call_vote.members[0].member.map(m => ({vote_id: m.vote_cast[0], lis: m.lis_member_id[0]}));
      this.setState({
        vote_results: votes
      })
    });

  }

  filterVotes(e){

    let v = e.currentTarget.value.toLowerCase();


      var filteredVotes:any[] = JSON.parse(JSON.stringify(this.state.listOfVotes));

      this.setState({
        listOfVotesf: filteredVotes.filter(l => {
          var combinedText = '';
          let question = "";
          if(typeof l.question[0] == "object"){
            question = l.question[0]._;
        }else{
            question = l.question[0];
        }
        combinedText = question.toLowerCase() + " " + l.title[0].toLowerCase[0] + " " + (l.details ? l.details[0] : "").toLowerCase();
          return combinedText;
        })
      });
  }

  componentDidMount(){
    axios.get('/api/votingList').then((response:any) => {
      var votes = response.data.vote_summary.votes[0].vote.map(v => Object.assign(v, {key: v.vote_number}));
      this.setState({
        listOfVotes: votes,
        listOfVotesf: votes
      });
      //this.dataList = response.data.vote_summary.votes;
  });
  }

  render() {
        return (
          <div style={this.style}>
            
            {/* <BarChart data={"https://s3-us-west-2.amazonaws.com/data-od/Data/raw_data.csv"} size={[1500,300]} /> */}
            <SenateMap votingLines={this.state.vote_results} />
            <div className="classname">
            <VoteFilter onChange={this.filterVotes} />
            <VotingList onChange={this.updateMap} listOfVotes={this.state.listOfVotesf}/>
            <VoteDetails vote_id={this.state.vote_id} />
            </div>
          </div>
        );
     }
}

export default SenateVoting;