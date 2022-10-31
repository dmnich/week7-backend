const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const listEndpoints = require('express-list-endpoints');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// eslint-disable-next-line new-cap
const Task = new mongoose.model('Task', {

  description: {
    type: String,
    minlength: 10,
    maxlength: 200
  },
  title: {
    type: String,
    maxlength: 50
  },
  isChecked: {
    type: Boolean,
    default: false
  },
  date: {
    type: Number,
    default: Date.now
  }
});

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());
app.options('*', cors());
app.get('/', async (req, res) => {
  res.send(listEndpoints(app))
});


app.get('/tasks', async (req, res) => {
  const tasks = await Task.find({});
  res.status(200).json(tasks);
});

app.get('/test', async (req, res) => {
  const tasks = await Task.find({});
  res.status(200).json('test');
});



app.post('/tasks', async (req, res) => {
  const { description, title } = req.body;

  try {
    const newTask = await new Task({ description, title }).save();
    res.status(200).json(newTask);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.post('/tasks/:id/check', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      [
        {
          $set: {
            isChecked: {
              $eq: [false, '$isChecked']
            }
          }
        }
      ],
      {
        new: true
      }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
