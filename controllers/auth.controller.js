const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const user = await User.create({
            first_name,
            last_name,
            email,
            password
        });

        res.status(201).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({
            status: 'success',
            data: { token }
        });
    } catch (err) {
        next(err);
    }
};
