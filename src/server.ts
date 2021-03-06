import config from './config'
import database from './database'
import { generateAuthToken } from './utils/generateAuthToken'
import { userType } from './types/user'
import { authenticateToken } from './middlewares/authenticateToken'

const express = require('express')
const app = express()
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

app.get('/users', async (req: any, res: any) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  
  const startingPosition = (page - 1) * limit
  const endingPosition = page * limit
  
  const users = await database.select('*').from('users').limit(limit).offset(startingPosition)
  const count = await database.count({ count: '*' }).from('users').first().then(result => result.count)
  
  const pageInfo: any = {};

  pageInfo.hasNextPage = endingPosition < count
  pageInfo.hasPrevPage = startingPosition > 0

  if(endingPosition < count) {
    pageInfo.next = {
      page: page + 1,
      limit: limit
    }
  }
  
  if(startingPosition > 0) {
    pageInfo.prev = {
      page: page - 1,
      limit: limit
    }
  }

  const data: any = {}

  data.results = users
  data.pageInfo = pageInfo

  res.json(data)
})

app.get('/posts', authenticateToken, async (req: any, res: any) => {
  const posts = await database.select().from('posts').where('author', req.user.name)
  res.json(posts)
})

app.post('/posts', async (req: any, res: any) => {
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
  const user: any = await database.select().from('users').where('name', req.body.name).first()
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
  const userName = await database.select().from('users').where('name', req.body.name).first()
  const nameIsTaken = typeof userName !== 'undefined'
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

app.post('/sign-out', async (req: any, res: any) => {
  const refreshToken = req.body.token
  try {
    res.sendStatus(200)
    return database.table('refreshTokens').where('token', refreshToken).del()
  } catch {
    res.sendStatus(500)
  }
})

app.post('/token', async (req: any, res: any) => {
  const refreshToken = req.body.token
  const refreshTokenFromDb = await database.select().from('refreshTokens').where('token', refreshToken).first()

  if (refreshToken.length === 0) return res.status(401).send('No token provided')
  if (typeof refreshTokenFromDb === 'undefined') return res.status(403).send('Invalid token')
  
  jwt.verify(refreshToken, process.env.REFRESH_JWT_TOKEN, (e: any, user: userType) => {
    if (e) return res.sendStatus(403)
    
    const accessToken = generateAuthToken({ name: user.name })
    res.json({ accessToken })
  })
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