const jwt = require('jsonwebtoken');
require('dotenv').config();
const { ACCESS_TOKEN_SECRET } = process.env;

const generateAccessToken = (userId) => {
    return jwt.sign({ _id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const verifyAccessToken = ({ req }) => {
    const accessToken = req.headers.authorization || '';
    return {
        _id: accessToken ? (jwt.verify(accessToken, ACCESS_TOKEN_SECRET)?._id || '') : ''
    };
}

module.exports = { generateAccessToken, verifyAccessToken };
