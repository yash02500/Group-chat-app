const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
dotenv.config();

//User sign up
const addUser = async (req, res, next) => {
  const { name, email, mobile, password } = req.body;
  console.log("Request received", req.body);
  if (!name || !email || !mobile || !password) {
    console.log("Values missing");
    return res.sendStatus(400);
  }

  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      console.log("Email already exists");
      return res.status(409).send("Email already exists");
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      console.log(err);
      const newUser = await User.create({
        name: name,
        email: email,
        mobile: mobile,
        password: hash,
      });
      console.log("User added");
      res.status(201).json(newUser);
    });
  } catch (error) {
    console.log(error, JSON.stringify(error));
    res.status(500).json({ error });
  }
};

// Generating jwt token
const generateToken = (id, name) => {
  return jwt.sign({ userId: id, name: name }, process.env.JWT_TOKEN);
};

//User login
const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login Request received", req.body);
  if (!email || !password) {
    console.log("Login Values missing");
    return res.sendStatus(400);
  }

  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      console.log("Email not found");
      return res.status(404).send("Email not found");
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        throw new Error("Something went wrong");
      }

      if (result) {
        res
          .status(200)
          .json({
            message: "Login successful",
            token: generateToken(user.id, user.name),
          });
      } else {
        res.status(401).send("Incorrect password");
      }
    });
  } catch (error) {
    console.log(error, JSON.stringify(error));
    res.status(501).json({ error });
  }
};

module.exports = {
  addUser,
  login,
};
