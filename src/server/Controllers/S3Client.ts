import * as AWS from "aws-sdk";
import { S3 } from "aws-sdk";
import * as fs from "fs";

// const AWS:any = require('aws-sdk');
const client = new AWS.S3({
  accessKeyId: process.env.S3_KEY_ID,
  secretAccessKey: process.env.S3_SECRET
});

export function upload(
  path,
  name,
  bucket = "data-od",
  progress = (...args) => {}
) {
  return new Promise((res, rej) => {
    let uploader: S3.ManagedUpload,
        finished = (err, sendData: S3.ManagedUpload.SendData ) => {
          console.log(sendData);
        };

    fs.readFile(path, "utf8", (err, data) => {
      console.log(data);
      if(err){
        return console.error("Fatal something");
      }
      uploader = client.upload({
        Bucket: bucket,
        Key: "Data/" + name,
        ACL: "public-read",
        Body: new Buffer(data)
      }, null, finished);
    });
  });
}

export function download(path, bucket) {}
