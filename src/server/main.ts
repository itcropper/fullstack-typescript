import * as express from 'express';
import * as path from 'path';
import { getVersion } from '../shared/utils';
import * as config from './config';
import { apiRouter } from './routes/api-router';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import * as mongoose from 'mongoose'

require('dotenv').config()

var SERVER_PORT = Number(process.env.PORT || 8080);
var MONGOOSE_URL =
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL  || 
  'mongodb://localhost:27017';

mongoose.connect(MONGOOSE_URL, null, function(err) {
  if (err) { 
      console.log ('ERROR connecting to: --> ' + MONGOOSE_URL + '. ' + err);
  } else {
      console.log ('Succeeded connected to: ' + MONGOOSE_URL);
  }
});

console.log(`The App version is ${getVersion()}`);

const app = express();
app.set('view engine', 'ejs');

app.use('/assets', express.static(path.join(__dirname, '..', '..', '..', 'assets')));
app.use(apiRouter());
app.use(staticsRouter());
app.use(pagesRouter());

app.listen(config.SERVER_PORT, () => {
  console.log('ENV ===========>', process.env.NODE_ENV)
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});
