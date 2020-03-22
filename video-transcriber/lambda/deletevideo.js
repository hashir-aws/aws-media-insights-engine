/**
  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  A copy of the License is located at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  or in the "license" file accompanying this file. This file is distributed 
  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
  express or implied. See the License for the specific language governing 
  permissions and limitations under the License.
*/

var AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});
var s3 = new AWS.S3();

/**
 * Deletes an input video from s3
 */
exports.handler = async (event, context, callback) => {

    console.log('[INFO] got event: %j', event);

    var responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
    };

    try
    {
        var videoName = event.pathParameters.videoName;

        if (await deleteFromS3(process.env.VIDEO_BUCKET, "videos/" + videoName)) {
            console.log("Deleted input video from S3");
        }

        const response = {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify("Successfully deleted input video from S3")
        };

        console.log("[INFO] made response: %j", response);

        callback(null, response);
    }
    catch (error)
    {
        console.log("[ERROR] Failed to delete video and assets", error);
        const response = {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({  
                "message": "Failed to delete video: " + error 
            })
        };
        callback(null, response);
    }
};

/**
 * Deletes an object from S3 returning true if
 * the object was deleted successfully
 */
async function deleteFromS3(bucket, key)
{
    try
    {
        var deleteParams = {
            Bucket: bucket,
            Key: key
        };

        await s3.deleteObject(deleteParams).promise();

        console.log("[INFO] successfully deleted object: s3://%s/%s", bucket, key);

        return true;
    }
    catch (error)
    {
        console.log("[WARNING] failed to delete from s3://%s/%s cause: %s",
            bucket, key, error);
        return false;
    }
}
