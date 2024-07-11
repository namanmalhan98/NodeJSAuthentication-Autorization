const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('./Models/userModel');
const app = express();
const port = 5000;

const dbName = 'NodeAuth';
const secretKey = 'your_secret_key'; // Change this to a more secure secret key

// MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017/' + dbName;

// Connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, options)
    .then(() => {
        console.log('Connected Successfully to MongoDB!');
    })
    .catch(error => console.log('Failed to connect to MongoDB!', error));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to my server!');
});

// User registration route
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const user = new userModel({ name, email, password, role });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Invalid email or password');
        }
        const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// Middleware to verify JWT token and role
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access token missing or invalid');
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).send('Invalid token');
        }
        req.user = user;
        next();
    });
};

// Middleware to check for specific roles
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).send('You do not have the required permission');
    }
    next();
};

// Protected route
app.get('/protected', authenticateJWT, (req, res) => {
    res.send('This is a protected route');
});

// Admin-only route
app.get('/admin', authenticateJWT, authorizeRoles('admin'), (req, res) => {
    res.send('This is an admin-only route');
});

// Get all users (for admins)
app.get('/getAllUsers', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await userModel.find({});
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving users');
    }
});

app.listen(port, () => console.log(`Server is working on ${port}`));
