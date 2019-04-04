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
import csv = require('csv');
import json2csv  = require('json2csv');
import NodeGeocoder = require('node-geocoder');
import { Table, ITableModel } from "../Models/Table";
const S3Client: { upload(virtualPath: string, newFileName: string): Promise<any>, download(): Promise<any> } = require("./S3Client");


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
	
	//var id = req.user._id;

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
	
	busboy.on('file', (fieldname, f, fname, encoding, mimetype) => {
		
		let once = true;
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

		file.pipe(csv())
		.on('data', function (data) {
			if(once){
				//console.log(data, params.locationColumn, data[params.locationColumn]);
				once = false;
			}

			if(params['locationColumn'] && data[params['locationColumn']]) {
				baseLocation = params['baseLocation'] || "";
				location = data[params['locationColumn']] + "," + baseLocation;
				locationPromises.push(new Promise((resolve, rej) => {
					try{
						geocoder.geocode(location, function(err, result) {
							if(err){
								console.log("Error--------------\n", err);
								return rej(err);
							}
							data.latitude = result[0].latitude;
							data.longitude = result[0].longitude;
							dataArray.push(data);
							//console.log(data);
							resolve(data);
						}); 
					}catch(e){
						console.log('FAILED-------------------')
						rej(e);
					}
				}));
			}
		})
		.on('end', function(){

		});

	});

	busboy.on('finish', function() {
		var s3FileName = `${params.name}_${new Date().getTime()}${path.extname(fileName)}`;
		console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
		Promise.all(locationPromises).then((rows) => {
			//console.log("-----------------", dataArray[0])
			var parser = new Parser({ fields: Object.keys(dataArray[0]) });
			var csv = parser.parse(dataArray);
			fs.openSync(tempFilePath, 'w');

			fs.writeFile(tempFilePath, csv, "utf8", () => {

				S3Client.upload(tempFilePath, s3FileName)
				.then((val) => {
					console.log('uploaded to S3', val);
				});

				table = Object.assign(table, <ITableModel>{
					name: params.name,
					link: `https://s3-us-west-2.amazonaws.com/data-od/Data/${s3FileName}`,
					description: params.description,
					is_private: params.isPrivate || false,
					expires: new Date("1/1/2100"),
					tags: params.tags,
					
				});
	
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
	});     

	req.pipe(busboy);

}