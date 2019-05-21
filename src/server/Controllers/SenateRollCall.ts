

import * as https from "https";
import * as xml2js from "xml2js";

let parseString = xml2js.parseString;

export function getVotingList(req, res){
    https.get('https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_116_1.xml',  votingList => {
        let body = "";
        votingList.on('data', data => {
            body += data;
        });
        votingList.on('end', () => {
            parseString(body, (error, data) => {
                // console.log(body);
                if(error)
                  res.json(error);
                res.json(data);
            });
        })



    });

}

export function getVoteResults(req, res){
    var vote = req.params.vote_id;

    https.get(`https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_${vote}.xml`, vote_results => {
        let body = "";
        vote_results.on('data', data => {
            body += data;
        });
        vote_results.on('end', () => {
            parseString(body, (error, data) => {
                // console.log(body);
                if(error)
                  res.json(error);
                res.json(data);
            });
        })
    })
}