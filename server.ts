import { FC } from 'fc'

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

//const jwt = require('jsonwebtoken')

app.use(express.json())

type userType = {
  name: string;
  password: string;
}

const users: FC<userType[]> = []

app.get('/users', (req, res) => {
  res.json(users)
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
  const user = users.find(user => user.name = req.body.name)
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
  }
})

app.listen(3030)