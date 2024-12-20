import crypto from 'crypto';

// Generate a 256-bit (32-byte) random key
const secretKey = crypto.randomBytes(64).toString('hex');
//console.log('Your secret key:', secretKey);
