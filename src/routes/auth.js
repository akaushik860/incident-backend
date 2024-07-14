const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const secretKey = 'your_secret_key';  // Replace with a secure key

// Signup Route
router.post('/signup', [
    check('type').isIn(['Individual', 'Enterprise', 'Government']).withMessage('Type must be Individual, Enterprise, or Government'),
    check('firstname').notEmpty().withMessage('First name is required'),
    check('email').isEmail().withMessage('Email is invalid'),
    check('address').notEmpty().withMessage('Address is required'),
    check('country').notEmpty().withMessage('Country is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('pincode').notEmpty().withMessage('Pincode is required'),
    check('mobilenumber').notEmpty().withMessage('Mobile number is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Confirm password does not match password');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { type, firstname, lastname, email, address, country, state, city, pincode, mobilenumber, fax, phone, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = new User({ type, firstname, lastname, email, address, country, state, city, pincode, mobilenumber, fax, phone, password });
        await user.save();

        res.status(201).json({status: 200, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error ${error}` });
    }
});

// Login Route
router.post('/login', [
    check('email').isEmail().withMessage('Email is invalid'),
    check('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 400,message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ state: 400, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({
            status: 200,
            token,
            user: {
                type: user.type,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                address: user.address,
                country: user.country,
                state: user.state,
                city: user.city,
                pincode: user.pincode,
                mobilenumber: user.mobilenumber,
                fax: user.fax,
                phone: user.phone,
                id: user._id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
