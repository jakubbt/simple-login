import config from './config'
import database from './database'
import { generateAuthToken } from './utils/generateAuthToken'
import { userType } from './types/user'
import { postType } from './types/post'
import { authenticateToken } from './middlewares/authenticateToken'

const express = require('express')
const app = express()
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

app.get('/users', async (req: any, res: any) => {
  const users = await database.select('*').from('users')
  res.json(users)
})

app.get('/posts', authenticateToken, async (req: any, res: any) => {
  const posts = await database.select('*').from('posts')
  res.json(posts.filter(post => post.author === req.user.name))
})

app.post('/create-post', async (req: any, res: any) => {
  try {
    res.status(200).send()
    return database.insert({
      author: req.body.author,
      title: req.body.title
    }).into('posts')
  } catch {
    res.status(500).send('Something went wrong')
  }
})

app.post('/login', async (req: any, res: any) => {
  const users = await database.select('*').from('users')
  const user = users.find((user: userType) => user.name === req.body.name)
  if (typeof user === 'undefined') {
    return res.status(400).send('Cannot find user')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.status(200)
      const username = req.body.name
      const user = { name: username }

      const userAccessToken = generateAuthToken(user)
      const refreshToken = jwt.sign(user, process.env.REFRESH_JWT_TOKEN)

      res.json({
        accessToken: userAccessToken,
      })

      return database.insert({
        token: refreshToken
      }).into('refreshTokens')
    } else {
      res.send('Wrong password')
    }
  } catch {
    res.status(500).send('Something went wrong')
  }
})

app.post('/sign-up', async (req: any, res: any) => {
  const users = await database.select('*').from('users')
  const userNames = users.map((user: userType) => user.name)
  const nameIsTaken = userNames.includes(req.body.name)
  if (nameIsTaken) {
    return res.status(400).send('Username is taken')
  } else {
    try {
      const hashedPassowrd = await bcrypt.hash(req.body.password, 10)

      res.status(201).send()
      
      return database.insert({
        name: req.body.name,
        password: hashedPassowrd
      }).into('users')
    } catch {
      res.status(500).send()
    }
  }
})

app.post('/token', async (req: any, res: any) => {
  const refreshTokens = await (await database.select('*').from('refreshTokens')).map(row => row.token)
  const refreshToken = req.body.token

  if (refreshToken.length === 0) return res.status(401).send('No token provided')
  if (!refreshTokens.includes(refreshToken)) return res.status(403).send('Invalid token')
  
  jwt.verify(refreshToken, process.env.REFRESH_JWT_TOKEN, (e: any, user: userType) => {
    if (e) return res.sendStatus(403)
    
    const accessToken = generateAuthToken({ name: user.name })
    res.json({ accessToken })
  })
})

app.post('/sign-out', async (req: any, res: any) => {
  const refreshToken = req.body.token
  try {
    res.sendStatus(200)
    return database.table('refreshTokens').where('token', refreshToken).del()
  } catch {
    res.sendStatus(500)
  }
})

async function start(): Promise<void> {
  try {
    if ('migrations' in config.database) {
      await database.migrate.latest({ directory: config.database.migrations.directory });
    }

    app.listen(process.env.PORT, () => {
      console.log(`Server started at http://localhost:${ process.env.PORT }`)
    });
  } catch(error) {
    process.exit(1)
  }
}

start()