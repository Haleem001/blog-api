const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
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
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({
            status: 'success',
            data: { token }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
