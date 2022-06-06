require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
console.log(process.env);

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology:true })
    .then(() => console.log('Connection to MongoDB has succeded!'))
    .catch(() => console.log('Connection to MongoDB has failed!'));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces/', sauceRoutes);

module.exports = app;