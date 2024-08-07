
const token = localStorage.getItem("token");

if (!token) {
  alert("You need to login first");
  window.location.href = "login.html";
}

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
let currentGroupId = null;

document.addEventListener("DOMContentLoaded", function () {
  loadGroups();

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

  // Save user message
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentGroupId) {
      alert("Please select a group");
      return;
    }

    const userMessage = message.value;
    append(`<strong>You</strong><br> ${userMessage}`, "right");
    socket.emit("send", userMessage);

    const saveUserMessage = {
      message: userMessage,
      userId: uid,
      name: username,
      groupId: currentGroupId
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

  // socket.on("user-joined", (name) => {
  //   append(`<strong>${name}</strong> joined the chat`, "center");
  // });

  socket.on("receive", (data) => {
    append(`<strong>${data.name}</strong><br> ${data.message}`, "left");
  });

  // socket.on("left", (name) => {
  //   append(`<strong>${name}</strong> left the chat`, "center");
  // });


  // Creating group
  const showCreateGroupFormButton = document.getElementById("show-create-group-form");
  const createGroupForm = document.getElementById("create-group-form");
  showCreateGroupFormButton.addEventListener("click", () => {
    createGroupForm.style.display = createGroupForm.style.display === "none" ? "block" : "none";
  });

  const membersContainer = document.getElementById("members-container");
  const addMemberButton = document.getElementById("add-member");

  addMemberButton.addEventListener("click", () => {
    const newMemberInput = document.createElement("input");
    newMemberInput.type = "text";
    newMemberInput.classList.add("form-control", "member-input", "mb-2");
    newMemberInput.placeholder = "Member Mobile Number";
    membersContainer.appendChild(newMemberInput);
  });

  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const groupName = document.getElementById("group-name").value;
    const memberInputs = document.querySelectorAll(".member-input");
    const members = Array.from(memberInputs).map(input => input.value).filter(value => value.trim() !== '');

    const newGroup = {
      name: groupName,
      adminId: uid,
      members: members
    };

    try {
      const response = await axios.post("http://localhost:3000/groups/create", newGroup, {
        headers: { Authorization: token },
      });
      if (response.status === 201) {
        alert("Group created successfully!");
        loadGroups();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  });
});

// Getting user messages
async function getUserMessages(groupId) {
  try {
    const response = await axios.get(
      `http://localhost:3000/user/getUserMessages/${groupId}`,
      { headers: { Authorization: token } }
    );
    return response.data.messages;
  } catch (error) {
    console.log(error);
  }
}

function showMessages(groupId) {
  getUserMessages(groupId)
    .then((data) => {
      const messageContainer = document.getElementById("message-container");
      messageContainer.style.display='block';

      const message = document.getElementById('message');
      message.style.display='block';
      
      const plane = document.getElementById('plane');
      plane.style.display='block';

      messageContainer.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach((msg) => {
          const messageElement = document.createElement("div");
          messageElement.dataset.id = msg.id;
          messageElement.classList.add("message");

          if (msg.userId == uid) {
            messageElement.innerHTML = `<strong>You</strong><br>${msg.message}`;
            messageElement.classList.add("right");
          } else {
            messageElement.innerHTML = `<strong>${msg.User.name}</strong><br>${msg.message}`;
            messageElement.classList.add("left");
          }

          messageContainer.appendChild(messageElement);
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
      } else {
        console.log("No messages found for this group");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

// Loading groups
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
      groupItem.style.cursor = "pointer";
      groupItem.style.border = "1.2px solid #ccc";
      groupItem.style.marginBottom = "0.7%";
      groupItem.style.marginTop = "0.7%";
      groupItem.addEventListener("click", () => joinGroupChat(group.id, group.name));
      groupList.appendChild(groupItem);
      groupContainer.appendChild(groupList);
    });
  } catch (error) {
    console.log(error);
  }
}

function joinGroupChat(groupId, groupName) {
  currentGroupId = groupId;
  document.getElementById("current-group-name").innerText = groupName;
  showMessages(groupId);

   // Make chat container visible on smaller screens
  const chatContainer = document.querySelector(".container");
  if (window.innerWidth <= 768) {
    chatContainer.classList.add("active");
  }
}


// Logout user
function logOut() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
