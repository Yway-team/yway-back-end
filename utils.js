async function getImageDataFromURL(url) {
    url = new URL(url);
    let protocol;
    if (url.protocol === 'http:') {
        protocol = require('http');
    } else if (url.protocol = 'https:') {
        protocol = require('https');
    } else return null;  // invalid protocol
    return new Promise((resolve, reject) => {
        protocol.get(url, res => {
            res.setEncoding('base64');
            let imgData = 'data:' + res.headers['content-type'] + ';base64,';
            res.on('data', data => {
                imgData += data;
            });
            res.on('end', () => {
                resolve(imgData);
            });
        }).on('error', e => reject(e.message));
    });
}

module.exports = { getImageDataFromURL };
