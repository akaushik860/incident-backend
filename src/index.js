const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incident');
const { authMiddleware } = require('./middleware/auth');  // Assuming you have an authentication middleware
const cors = require('cors');


const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };


const app = express();
const port = 9000;

app.use(cors(corsOptions));

const mongoUri = 'mongodb://localhost:27017/users';  // Replace with your MongoDB connection string

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB', err);
});

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/incident', authMiddleware, incidentRoutes);  // Protect incident routes with authentication middleware


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
