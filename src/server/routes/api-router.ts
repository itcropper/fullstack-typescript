import * as bodyParser from 'body-parser';
import { Router } from 'express';
import { users, getUserById } from '../db';
import * as TableController from "../Controllers/Table";
import * as SenateController from "../Controllers/SenateRollCall";

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get('/api/users', (req, res) => {
    res.json(users);
  });

  router.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    res.json(getUserById(userId));
  });

  router.post('/api/set-user', (req, res) => {
    res.send(`ok`);
  });

  router.route("/api/table")
    .get(TableController.getTable)
    .post(TableController.createTable);

  router.route('/api/votinglist')
  .get(SenateController.getVotingList);

  router.route('/api/voteresults/:vote_id')
  .get(SenateController.getVoteResults);

  return router;
}
