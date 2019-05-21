//const busboy = require('connect-busboy');
//const Busboy = require('busboy');
//const path = require('path');
//const temp_dir = path.join(process.cwd(), 'tmp/');
//const fs = require('fs');
//const Table = require('../Models/Table');
//const S3 = require('./S3Client');
//const csv = require('csv-parser');
//const {Parser} = require('json2csv');
//const NodeGeocoder = require('node-geocoder');

import Busboy = require('busboy');
import * as path from 'path';
import * as fs from 'fs';

import json2csv  = require('json2csv');
import NodeGeocoder = require('node-geocoder');
import { Table, ITableModel } from "../Models/Table";
import * as S3Client from "./S3Client";

const csvtojson = require("csvtojson");
const openGeocoder = require('node-open-geocoder');

const temp_dir = path.join(process.cwd(), 'tmp/');
const Parser = json2csv.Parser;

const geocoder = NodeGeocoder({
	provider: 'google',
   
	// Optional depending on the providers
	httpAdapter: 'https', // Default
	apiKey: process.env.GOOGLE_GEO_KEY, // for Mapquest, OpenCage, Google Premier
	formatter: null         // 'gpx', 'string', ...
  });

function guid(small = false) {
	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}
	return [s4(), s4(), s4()].concat(small? [] : [s4(), s4(), s4(), s4(), s4()]).join('');
  };

export function getTable(req, res) {

	  res.json(req.params);
}

export function createTable(req, res) {

	var id = guid(true) +  new Date().getTime(),
		tempFilePath = '',
		fstream = {},
		busboy = new Busboy({ headers: req.headers }),
		table = new Table(),
		fileName = '',
		params: {
			baseLocation?: string,
			locationColumn?: string,
			name?: string,
			description?: string,
			tags?: string[],
			isPrivate?: boolean
		} = {},
		file = null,
		locationPromises = [],
		dataArray = [];


	busboy.on('field', function(fieldname, val) {
		params[fieldname] = val;
		//console.log(fieldname, val);
	});

	function runWhenFileUploaded(){
		var calls = 0; 
		return function(){
			if(++calls <= 1){
				return;
			}
		var s3FileName = `${params.name}_${new Date().getTime()}${path.extname(fileName)}`;
		//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
		Promise.all(locationPromises).then((rows) => {
			//console.log("-----------------", dataArray[0], rows)
			var parser = new Parser({ fields: Object.keys(dataArray[0]) });
			var csv = parser.parse(dataArray);
			fs.openSync(tempFilePath, 'w');

			fs.writeFile(tempFilePath, csv, "utf8", () => {

				S3Client.upload(tempFilePath, s3FileName)
				.then((val) => {
					console.log('uploaded to S3', val);
				});

				table.name = params.name;
				table.link = `https://s3-us-west-2.amazonaws.com/data-od/Data/${s3FileName}`;
				table.description = params.description;
				table.is_private = params.isPrivate || false;
				table.expires = new Date("1/1/2100");
				table.tags = params.tags;
	
				table.save((err, saved) => {
					if(err){
						return res.status(500).json(err);
					}
					return res.json(saved);
				});
			});
	
	
			//delete temp file after 5 minutes
			setTimeout(function(){
				fs.unlink(tempFilePath, function (err) {
					if (err) console.log(err);
						console.log('Temp Time Expired. Successfully deleted ' + tempFilePath);
				});
			}, 1000 * 60 * 5);
			});
		}
	}

	var finishFile = runWhenFileUploaded();
	
	busboy.on('file', (fieldname, f, fname, encoding, mimetype) => {
		
		let once = 2;
		let location = "";
		let baseLocation;

		if(!fname.length){
			return file.resume();
		}

		if (!fs.existsSync(temp_dir)){
			fs.mkdirSync(temp_dir);
		}
		fileName = fname;
		tempFilePath = path.join(temp_dir, id + path.extname(fname));
		file = f;

		finishFile()
		csvtojson()
		.fromStream(file)
		.subscribe((row)=>{
			return new Promise((res,rej)=>{
					try{

						baseLocation = params['baseLocation'] || "";
						location = row[params.locationColumn] + ", " + baseLocation;

						openGeocoder()
						.geocode(location)
						.end((err, result) => {
							if(err){
								console.log("Error--------------\n", err);
								return rej(err);
							}
							if(result.length === 0){
								return res(row);
							}
							//console.log(JSON.stringify(result, null, 4));
							row.latitude = result[0].lat;
							row.longitude = result[0].lon;
							dataArray.push(row);
							console.log(JSON.stringify(row, null, 4));
							res(row);

						})

						// geocoder.geocode(location, function(err, result) {
						// 	if(err){
						// 		console.log("Error--------------\n", err);
						// 		return rej(err);
						// 	}
						// 	data.latitude = result[0].latitude;
						// 	data.longitude = result[0].longitude;
						// 	dataArray.push(data);
						// 	console.log(data);
						// 	resolve(data);
						// }); 
					}catch(e){
						console.log('FAILED-------------------')
						rej(e);
					}
			});

			// data.forEach(row => {


			// 	locationPromises.push(new Promise((resolve, rej) => {
			// 		try{
			// 			openGeocoder()
			// 			.geocode(location)
			// 			.end((err, result) => {
			// 				if(err){
			// 					console.log("Error--------------\n", err);
			// 					return rej(err);
			// 				}
			// 				console.log(JSON.stringify(result[0], null, 4));
			// 				row.latitude = result[0].lat;
			// 				row.longitude = result[0].lon;
			// 				dataArray.push(row);
			// 				//console.log('LOCATION==========>', data)
			// 				resolve(data);

			// 			})

			// 			// geocoder.geocode(location, function(err, result) {
			// 			// 	if(err){
			// 			// 		console.log("Error--------------\n", err);
			// 			// 		return rej(err);
			// 			// 	}
			// 			// 	data.latitude = result[0].latitude;
			// 			// 	data.longitude = result[0].longitude;
			// 			// 	dataArray.push(data);
			// 			// 	console.log(data);
			// 			// 	resolve(data);
			// 			// }); 
			// 		}catch(e){
			// 			console.log('FAILED-------------------')
			// 			rej(e);
			// 		}
			// 	}));


			// });
		})

	});

	req.pipe(busboy);

}

/*
drjasonwysocki@gmail.com

*/