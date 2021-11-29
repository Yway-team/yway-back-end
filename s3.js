const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const { S3_ACCESS_KEY_ID, S3_BUCKET, S3_REGION, S3_SECRET_ACCESS_KEY } = process.env;

const config = {
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
    }
};

async function uploadObject(data, name) {
    const params = {
        Bucket: S3_BUCKET,
        Key: name,
        Body: data
    };
    const client = new S3Client(config);
    const command = new PutObjectCommand(params);
    try {
        await client.send(command);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function deleteObject(name) {
    const params = {
        Bucket: S3_BUCKET,
        Key: name
    };
    const client = new S3Client(config);
    const command = new DeleteObjectCommand(params);
    try {
        await client.send(command);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = { deleteObject, uploadObject };
