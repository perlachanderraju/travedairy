const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json())

const User = require('./models/User')
const DiaryEntry = require('./models/DiaryEntry')

let db = null
const dbpath = path.join(__dirname, 'travelDairy.db')

const initialiseDBAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

initialiseDBAndServer()

module.exports = app

app.post('/register', async (request, response) => {
  const userdetails = request.body
  const {username, email, password} = userdetails
  const userQuery = `select * from user where username='${username}'`
  const userArray = await db.get(userQuery)
  if (userArray !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else {
    if (password.length > 5) {
      const haspassword = await bcrypt.hash(password, 10)
      const updateQuery = `insert into user(username,password,name,gender)
      values('${username}','${haspassword}','${name}','${gender}')`
      await db.run(updateQuery)
      response.status(200)
      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  }
})
//api2
app.post('/login', async (request, response) => {
  const userdetails = request.body
  const {username, password} = userdetails
  const loginQuery = `select * from user where username='${username}'`
  const loginArray = await db.get(loginQuery)
  if (loginArray === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const loginpassword = await bcrypt.compare(password, loginArray.password)
    if (loginpassword === true) {
      const jwtToken = jwt.sign(loginArray, 'chanderraju')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
//authentication
const authenticateToken = (request, response, next) => {
  const {tweet} = request.body
  const {id} = request.params
  let jwtcode = null
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtcode = authHeader.split(' ')[1]
  }
  if (jwtcode === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtcode, 'chanderraju', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.payload = payload
        request.id = id
        request.username = username
        next()
      }
    })
  }
}

app.post('/register', async (req, res) => {
  const {username, password} = req.body
  try {
    const user = await User.register(username, password)
    res.json(user)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

app.post('/login', async (req, res) => {
  const {username, password} = req.body
  try {
    const user = await User.login(username, password)
    const token = jwt.sign({username: user.username}, 'secret')
    res.json({token})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

app.post('/diary-entries', authenticateToken, async (req, res) => {
  const {title, description, date, location, photos} = req.body
  try {
    const diaryEntry = await DiaryEntry.create(
      title,
      description,
      date,
      location,
      photos,
    )
    res.json(diaryEntry)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

app.put('/diary-entries/:id', authenticateToken, async (req, res) => {
  const {title, description, date, location, photos} = req.body
  try {
    const diaryEntry = await DiaryEntry.update(
      req.params.id,
      title,
      description,
      date,
      location,
      photos,
    )
    res.json(diaryEntry)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

app.delete('/diary-entries/:id', authenticateToken, async (req, res) => {
  try {
    await DiaryEntry.delete(req.params.id)
    res.json({message: 'Diary entry deleted'})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

module.export = app
