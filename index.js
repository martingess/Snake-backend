const express = require('express');
const mongoose = require('mongoose');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes')
const app = express();

//MONGOOSE
mongoose.connect('mongodb://localhost:27017/snake-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//PATHS & middlewares
app.use(express.json());
app.use('/api/v1/result', resultRoutes);
app.use('/api/v1/user', userRoutes)
//SERVER
const port = 3015;
app.listen(port, () => console.log(`Server is runing on ${port}`));