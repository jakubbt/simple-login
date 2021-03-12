const express = require('express')
const app = express()

const users = [
  {
    name: 'Jakub',
    id: 1,
  },
  {
    name: 'Cowboy',
    id: 2,
  },
]

app.get('/users', (req, res) => {
  res.json(users)
})

app.listen(3030)