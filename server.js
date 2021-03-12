const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

//const jwt = require('jsonwebtoken')

app.use(express.json())

const users = []

app.get('/users', (req, res) => {
  res.json(users)
})

app.post('/users', async (req, res) => {
  /* try {
    const salt = await bcrypt.genSalt()
    const hashedPassowrd = await bcrypt.hash(req.body.password, salt)
    console.log(salt)
    console.log(hashedPassowrd)

    const user = { name: req.body.name, password: hashedPassowrd }
    users.push(user)
    res.status(201).send()
  } catch {
    res.status(500).send()
  } */

  const user = { name: req.body.name, password: req.body.password }
  //users.push(user)
  console.log(req.body)
  res.status(201).send()
})

app.listen(3030)