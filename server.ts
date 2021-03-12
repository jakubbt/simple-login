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
    id: 1,
  },
  {
    title: 'Post 2',
    id: 2,
  },
]

//routes
app.get('/users', (req, res) => {
  res.json(users)
})

app.get('/posts', (req, res) => {
  res.json(posts)
})

app.post('/users', async (req, res) => {
  try {
    const hashedPassowrd = await bcrypt.hash(req.body.password, 10)

    const user = { name: req.body.name, password: hashedPassowrd }
    users.push(user)
    res.status(201).send()
  } catch {
    res.status(500).send()
  }
})

app.post('/users/login', async (req, res) => {
  /* const user = users.find(user => user.name = req.body.name)
  if (user === null) {
    return res.status(400).send('Cannot find user')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send('Success')
    } else {
      res.send('Wrong password')
    }
  } catch {
    res.status(500).seend()
  } */

  const username = req.body.username
  const user = { name: username}

  const userAccessToken = jwt.sign(user, process.env.JWT_SECRET)
  res.json({ accessToken: userAccessToken})
})

function authenticateToken(req, res, next): void {

}

app.listen(3030)