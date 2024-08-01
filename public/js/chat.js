const token = localStorage.getItem("token");

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const decode = parseJwt(token);
const username = decode.name;
const uid = decode.userId;

document.addEventListener("DOMContentLoaded", function () {
  if (!token) {
    alert("You need to login first");
    window.location.href = "login.html";
  }

  showMessages();

  const socket = io("http://localhost:8000");
  const form = document.getElementById("send");
  const message = document.getElementById("message");
  const messageContainer = document.getElementById("message-container");

  const append = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerHTML = message;
    messageElement.classList.add("message", position);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = message.value;
    append(`<strong>You</strong><br> ${userMessage}`, "right");
    socket.emit("send", userMessage);

    const saveUserMessage = {
      message: userMessage,
      userId: uid,
      name: username,
    };

    try {
      await axios.post(
        "http://localhost:3000/user/userMessage",
        saveUserMessage,
        { headers: { Authorization: token } }
      );
    } catch (error) {
      console.log(error);
    }
    message.value = "";
  });


  socket.emit("new-user-joined", username);

  socket.on("user-joined", (name) => {
    append(`<strong>${name}</strong> joined the chat`, "center");
  });

  socket.on("receive", (data) => {
    append(`<strong>${data.name}</strong><br> ${data.message}`, "left");
  });

  socket.on("left", (name) => {
    append(`<strong>${name}</strong> left the chat`, "center");
  });

  const showCreateGroupFormButton = document.getElementById(
    "show-create-group-form"
  );
  const createGroupForm = document.getElementById("create-group-form");
  showCreateGroupFormButton.addEventListener("click", () => {
    createGroupForm.style.display =
      createGroupForm.style.display === "none" ? "block" : "none";
  });

  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const groupName = document.getElementById("group-name").value;
    
    const newGroup = {
      name: groupName,
      admin: uid,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/groups/create",
        newGroup,
        { headers: { Authorization: token } }
      );
      loadGroups();
      createGroupForm.style.display = "none";
    } catch (error) {
      console.log(error);
    }
  });

  loadGroups();
});

async function getUserMessages() {
  try {
    const response = await axios.get(
      `http://localhost:3000/user/getUserMessages`,
      { headers: { Authorization: token } }
    );
    return response.data.message;
  } catch (error) {
    console.log(error);
  }
}

function showMessages() {
  getUserMessages()
    .then((data) => {
      const messageContainer = document.getElementById("message-container");
      messageContainer.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((msg) => {
          const messageElement = document.createElement("div");
          messageElement.dataset.id = msg.id;
          messageElement.classList.add("message");

          if (msg.UserId == uid) {
            messageElement.innerHTML = `<strong>You</strong><br>${msg.message}`;
            messageElement.classList.add("right");
          } else {
            messageElement.innerHTML = `<strong>${msg.name}</strong><br>${msg.message}`;
            messageElement.classList.add("left");
          }

          messageContainer.appendChild(messageElement);
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
      } else {
        console.log("User messages missing");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

//Loading groups
async function loadGroups() {
  try {
    const response = await axios.get(`http://localhost:3000/groups/getGroups`, {
      headers: { Authorization: token },
    });
    const groups = response.data.groups;
    const groupList = document.getElementById("group-list");
    const groupContainer = document.getElementById("group-container");
    groupList.innerHTML = "";
    groups.forEach((group) => {
      const groupItem = document.createElement("li");
      groupItem.classList.add("list-group-item");
      groupItem.style.fontSize = "18px";
      groupItem.innerText = group.name;
      groupItem.addEventListener("click", () => joinGroup(group.id));
      groupList.appendChild(groupItem);
      groupContainer.appendChild(groupList);
    });
  } catch (error) {
    console.log(error);
  }
}
