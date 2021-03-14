const jwt = require('jsonwebtoken')
require('dotenv').config()

export function generateAuthToken(user: object) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '600s'})
}