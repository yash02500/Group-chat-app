const User = require('../models/user');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

//User sign up 
const addUser = async (req, res, next) => {
    const { name, email, mobile, password } = req.body;
    console.log("Request received", req.body);
    if(!name || !email || !mobile || !password){
        console.log('Values missing');
        return res.sendStatus(400);
    }

    try{
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            console.log('Email already exists');
            return res.status(409).send('Email already exists');
        }

        bcrypt.hash(password, 10, async (err, hash) => {
        console.log(err);
        const newUser = await User.create({
            name: name,
            email: email,
            mobile: mobile,
            password: hash,
        })
        console.log('User added');
        res.status(201).json(newUser)
    })

    } catch (error) {
        console.log(error, JSON.stringify(error))
        res.status(500).json({error})
    }
};


module.exports = {
    addUser
};