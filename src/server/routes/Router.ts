import * as express from 'express';
import * as tableController from '../Controllers/Table';

const router = express.Router();


router.route('/:id')
	.get(tableController.getTable)
	.post(tableController.createTable);


export default router;