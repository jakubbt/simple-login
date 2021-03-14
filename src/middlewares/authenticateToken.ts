import { userType } from '../types/user'

const jwt = require('jsonwebtoken')

export function authenticateToken(req: any, res: any, next: () => void): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: userType) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}