import { FC } from 'fc'

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
require('dotenv').config()

const jwt = require('jsonwebtoken')

app.use(express.json())


//types
type userType = {
  name: string;
  password: string;
  token?: string;
}

type postType = {
  title: string;
  id: number;
}

//dummy data
const users: FC<userType[]> = []
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
app.get('/users', (req: any, res: any) => {
  res.json(users)
})

app.get('/posts', authenticateToken ,(req: any, res: any) => {
  res.json(posts.filter(post => post.name === req.user.name))
})

//post
app.post('/sign-up', async (req: any, res: any) => {
  const userNames = users.map((user: userType) => user.name)
  const nameIsTaken = userNames.includes(req.body.name)
  if (nameIsTaken) {
    return res.status(400).send('Username is taken')
  } else {
    try {
      const hashedPassowrd = await bcrypt.hash(req.body.password, 10)
  
      const user = { name: req.body.name, password: hashedPassowrd }
      users.push(user)
      res.status(201).send()
    } catch {
      res.status(500).send()
    }
  }
})

app.post('/users/login', async (req: any, res: any) => {
  const user = users.find(user => user.name = req.body.name)
  if (user === null) {
    return res.status(400).send('Cannot find user')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.status(200)
      const username = req.body.name
      const user = { name: username }

      const userAccessToken = jwt.sign(user, process.env.JWT_SECRET)
      res.json({ accessToken: userAccessToken})
    } else {
      res.send('Wrong password')
    }
  } catch {
    res.status(500).send('No user')
  }
})

function authenticateToken(req: any, res: any, next: () => void): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: userType) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3030)