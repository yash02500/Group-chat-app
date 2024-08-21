const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
dotenv.config();
const app = express();

//Allowing socket.io in cors
const io = require("socket.io")(8000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

//Importing routes
const userRoute = require("./routes/userRoute");
const userMsgRoute = require("./routes/userMessages");
const groupsRoute = require("./routes/groups");
const sequelize = require("./util/database");

//Importing models
const User = require("./models/user");
const UserMessages = require("./models/userMessages");
const Group = require("./models/groups");
const GroupMember = require("./models/groupMember");

//defining relation
User.hasMany(UserMessages, { foreignKey: 'userId' });
UserMessages.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(UserMessages, { foreignKey: 'groupId' });
UserMessages.belongsTo(Group, { foreignKey: 'groupId' });

Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId' });
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId' });

GroupMember.belongsTo(User, { foreignKey: 'userId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

// Group.hasMany(GroupMember, { as: 'admins', foreignKey: 'groupId' });


//Parsing URL-encoded bodies (as sent by HTML forms) and using querystring library for parsing(extended:false)
app.use(bodyParser.urlencoded({ limit: '10mb', parameterLimit: 10000, extended: true }));
//Parsing JSON bodies (as sent by API clients)
app.use(bodyParser.json({ limit: '10mb' }));

//Serving static files from the "public" directory
app.use(express.static("public"));

//Accessing routes
app.use("/user", userRoute, userMsgRoute);
app.use("/groups", groupsRoute);

app.use(cors());

const port = process.env.PORT;

//User joining message using socket.io
const users = {};
io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", users[socket.id]);
  });
});

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log("server is running");
      app.get("/", (req, res, next) => {
        res.sendFile(path.join(__dirname, "public", "login.html"));
      });
    });
  })
  .catch((err) => console.log(err));
