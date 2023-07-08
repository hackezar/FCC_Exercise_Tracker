const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
//Get mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL)

//create schemas
const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: {type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const Exercise = mongoose.model("Exercise", ExerciseSchema);
app.use(cors())
app.use(express.static('public'))
// Middleware in order to get request body for challenge 2.
app.use(express.urlencoded({ extended: true })) 
app.use
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// 4. You can make a GET request to /api/users to geta list of all users.
app.get("/api/users", async (req, res) => {
  const users = await User.find({}).select("_id username");
  if (!users) {
    res.send("No users");
  } else {
    //responds with users array
    res.json(users);
  }
})
// 2.You can POST to /api/users with form data 'username' to create a new user
app.post("/api/users", async (req, res) => {
  console.log(req.body)
  // Use middleware to store in database
  const userObj = new User({
    username: req.body.username
  })
  //try catch block to catch errors
  try{
    const user = await userObj.save()
    console.log(user);
    //responds with user object
    res.json(user)
  }catch(err){
    console.log(err)
  }
  


  
})

// 7. You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body

  try{
    const user = await User.findById(id)
    if(!user){
      res.send("Could not find user")
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      })
      const exercise = await exerciseObj.save()
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      })
    }
  }catch(err){
    console.log(err);
    res.send("There was an error saving the exercise")
  }
})

  // 11. A GET request to /api/users/:_id/logs will return the user object with a log array of all the exercises added.
app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const id = req.params._id;
  const user = await User.findById(id);
  if(!user){
    res.send("Could not find user")
    return;
  }
  let dateObj = {}
  if (from) {
    dateObj["$gte"] = new Date(from)
  }
  if (to){
    dateObj["$lte"] = new Date(to)
  }
  let filter = {
    user_id: id
  }
  if(from || to){
    filter.date = dateObj;
  }
  const exercises = await Exercise.find(filter).limit(+limit ?? 500)

  const log = exercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: new Date().toDateString()
  }))

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log 
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
