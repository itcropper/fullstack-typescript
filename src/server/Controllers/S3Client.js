import * as AWS from 'aws-sdk';

const S3 = new AWS.S3();

var s3Client = function () {
    var client = S3.createClient({
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
            accessKeyId: process.env.S3_KEY_ID,
            secretAccessKey: process.env.S3_SECRET,
            // any other options are passed to new AWS.S3()
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        },
    });

    function upload(path, name, bucket = "data-od", progress=() =>{}){
        return new Promise((res, rej) => {
            var params = {
                localFile: path,
               
                s3Params: {
                  Bucket: bucket,
                  Key: "Data/" + name,
                  ACL:'public-read'
                  // other options supported by putObject, except Body and ContentLength.
                  // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                },
              };
              var uploader = client.uploadFile(params);
              uploader.on('error', function(err) {
                console.error("unable to upload:", err.stack);
                rej({
                    done: false,
                    message: err.stack
                });
              });
              uploader.on('progress', function() {
                  if(progress){
                    progress(uploader.progressMd5Amount,uploader.progressAmount, uploader.progressTotal);
                  }
                //console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
              });
              uploader.on('end', function() {
                  res({
                      done: true
                    });
              });
        })
    }

    function download(path, bucket){

    }

    return {
        upload,
        download
    };

}

module.exports = s3Client();
