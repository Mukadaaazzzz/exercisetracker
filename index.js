const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory store for users and exercises
let users = [];
let exercises = [];

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = {
    username: username,
    _id: users.length + 1
  };
  users.push(newUser);
  res.json(newUser);
});

// Get a list of all users
app.get('/api/users', (req, res) => {
  const userList = [];
  for (const user of users) {
    userList.push({ username: "user.username", _id: "user._id" });
  }
  res.json(userList);
});


// Add an exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = parseInt(req.params._id);
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newExercise = {
    userId: userId,
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = parseInt(req.params._id);
  const user = users.find(u => u._id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = exercises.filter(e => e.userId === userId);

  if (req.query.from || req.query.to) {
    const fromDate = req.query.from ? new Date(req.query.from) : new Date(0);
    const toDate = req.query.to ? new Date(req.query.to) : new Date();
    log = log.filter(e => new Date(e.date) >= fromDate && new Date(e.date) <= toDate);
  }

  if (req.query.limit) {
    log = log.slice(0, parseInt(req.query.limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({
      description: description,
      duration: duration,
      date: date
    }))
  });
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
