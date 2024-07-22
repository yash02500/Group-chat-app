const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const userRoute = require('./routes/userRoutes');

const sequelize = require('./util/database');

const User = require('./models/user');

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/user', userRoute);

app.use(cors());

const port = process.env.PORT;

sequelize.sync()
.then(() => {
 app.listen(port, () => {
  console.log('server is running');
   app.get('/', (req, res, next) => {
        res.sendFile(path.join(__dirname, "public", "login.html"));
    })
  });
 })
.catch((err) => console.log(err));
    
    