const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const { S3_ACCESS_KEY_ID, S3_BUCKET, S3_BUCKET_URL, S3_REGION, S3_SECRET_ACCESS_KEY } = process.env;

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

async function uploadImage(key, data, type, encoding) {
    const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: data,
        ContentType: `image.${type}`,
        ContentEncoding: encoding
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

async function deleteObject(key) {
    const params = {
        Bucket: S3_BUCKET,
        Key: key
    };
    const client = new S3Client(config);
    const command = new DeleteObjectCommand(params);
    try {
        await client.send(command);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function uploadBannerImg(obj, objId, objType) {
    if (obj.bannerImgData) {
        let [prefix, imgData] = obj.bannerImgData.split(',');
        const type = prefix.split(';')[0].split('/')[1];
        const encoding = prefix.split(';')[1];
        imgData = new Buffer.from(imgData, encoding);
        const key = `img/${objType}/${objId}/bannerImg.${type}`;  // objType === 'quiz' || objType === 'platform'
        const success = await uploadImage(key, imgData, type, encoding);
        if (success) obj.bannerImg = `${S3_BUCKET_URL}/${key}`;
        delete obj.bannerImgData;
        delete obj.bannerImgName;
    }
}

async function uploadThumbnailImg(obj, objId, objType) {
    if (obj.thumbnailImgData) {
        let [prefix, imgData] = obj.thumbnailImgData.split(',');
        const type = prefix.split(';')[0].split('/')[1];
        const encoding = prefix.split(';')[1];
        imgData = new Buffer.from(imgData, encoding);
        const key = `img/${objType}/${objId}/thumbnailImg.${type}`;  // objType === 'quiz' || objType === 'platform'
        const success = await uploadImage(key, imgData, type, encoding);
        if (success) obj.thumbnailImg = `${S3_BUCKET_URL}/${key}`;
        delete obj.thumbnailImgData;
        delete obj.thumbnailImgName;
    }
}

module.exports = { deleteObject, uploadObject, uploadImage, uploadBannerImg, uploadThumbnailImg };
