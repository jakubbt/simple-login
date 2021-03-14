import { FC } from 'fc'
import config from './config'
import database from './database'
import { userType } from './types/user'
import { postType } from './types/post'

import { authenticateToken } from './middlewares/authenticateToken'

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
require('dotenv').config()

const jwt = require('jsonwebtoken')

app.use(express.json())

//dummy data
const posts: FC<postType[]> = [
  {
    title: 'Post 1',
    name: "Jakub",
    id: 1,
  },
  {
    title: 'Post 2',
    name: "someoneelse",
    id: 2,
  },
]

//ROUTES
//get
app.get('/users', async (req: any, res: any) => {
  const users = await database.select('*').from('users')
  res.json(users)
})

app.get('/posts', authenticateToken ,(req: any, res: any) => {
  res.json(posts.filter(post => post.name === req.user.name))
})

//post
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

function generateAuthToken(user: object) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15s'})
}

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