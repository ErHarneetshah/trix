import crypto from 'crypto';
import jwtService from '../services/jwtService.js';

// Generate a 256-bit (32-byte) random key
const secretKey = crypto.randomBytes(64).toString('hex');
console.log('Your secret key:', secretKey);

const generateKey = new jwtService().generateCustomToken();
console.log('Your token key:', generateKey);