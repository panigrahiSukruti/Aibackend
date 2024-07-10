const mongoose = require('mongoose');
const express = require('express');
const usersRouter = require('./routes/users.js');
require('./server');
require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

  app.use(express.json());

  
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// })
app.use('/', usersRouter);

// app.listen(5000, () => {
//   console.log('Server is running on port 5000');
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message })
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// module.export = app;

