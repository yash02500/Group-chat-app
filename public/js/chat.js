const token = localStorage.getItem("token");

if (!token) {
  alert("You need to login first");
  window.location.href = "login.html";
}

const ip = '54.221.172.47';
const port= '3000';

// Function for parsing jwt
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

//Parsing jwt token
const decode = parseJwt(token);

//Extracting username adn id from logged user
const username = decode.name;
const uid = decode.userId;

let currentGroupId = null;

document.addEventListener("DOMContentLoaded", function () {
  loadGroups();

  const socket = io("http://localhost:8000");
  const form = document.getElementById("send");
  const message = document.getElementById("message");
  const messageContainer = document.getElementById("message-container");
  const fileInput = document.getElementById("fileInput");

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
    ///
    const file = fileInput.files[0];

    if (file) {
      // Upload file to server or cloud storage
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("currentGroupId", currentGroupId); // Append the group ID      

      try {
        const response = await axios.post(
          `http://${ip}:${port}/user/upload`,
          fileData,
          {
            headers: {
              Authorization: token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const fileUrl = response.data.fileUrl;
        const fileName = response.data.fileName;
        // Send message with file URL and sender's name
        socket.emit("send", {
          fileUrl: fileUrl,
          fileName: fileName,
          name: username
        });
        window.location.reload();

      } catch (error) {
        console.log(error);
      }
    }

    socket.on("receive", (data) => {
      const { fileUrl, name } = data;
      append(`<strong>${name}</strong><br> ${fileUrl}`, "left");
      if (fileUrl) {
        // Display file URL or attachment
        const fileElement = document.createElement("a");
        fileElement.href = fileUrl;
        fileElement.innerText = "View File";
        fileElement.style.display = "block";
        messageContainer.appendChild(fileElement);
      }
    });

    ////
    const userMessage = message.value;
    append(`<strong>You</strong><br> ${userMessage}`, "right");
    socket.emit("send", userMessage);

    const saveUserMessage = {
      message: userMessage,
      userId: uid,
      name: username,
      groupId: currentGroupId,
    };

    try {
      await axios.post(
        `http://${ip}:${port}/user/userMessage`,
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
  const showCreateGroupFormButton = document.getElementById(
    "show-create-group-form"
  );
  const createGroupForm = document.getElementById("create-group-form");
  showCreateGroupFormButton.addEventListener("click", () => {
    createGroupForm.style.display =
      createGroupForm.style.display === "none" ? "block" : "none";
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
    const members = Array.from(memberInputs)
      .map((input) => input.value)
      .filter((value) => value.trim() !== "");

    const newGroup = {
      name: groupName,
      adminId: uid,
      members: members,
    };

    try {
      const response = await axios.post(
        `http://${ip}:${port}/groups/create`,
        newGroup,
        {
          headers: { Authorization: token },
        }
      );
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

//Extract admin from current group
let groupAdmin = null;

// Getting user messages
async function getUserMessages(groupId) {
  try {
    const response = await axios.get(
      `http://${ip}:${port}/user/getUserMessages/${groupId}`,
      { headers: { Authorization: token } }
    );
    groupAdmin = response.data.admin.adminId;

    return response.data.messages;
  } catch (error) {
    console.log(error);
  }
}

//Showing messages of group fetched from backend
function showMessages(groupId) {
  getUserMessages(groupId)
    .then((data) => {
      const messageContainer = document.getElementById("message-container");
      messageContainer.style.display = "block";

      const message = document.getElementById("message");
      message.style.display = "block";

      const plane = document.getElementById("plane");
      plane.style.display = "block";

      const fileInput =document.getElementById('fileInput');
      fileInput.style.display = "block";

      const fileBtn =document.getElementById('fileBtn');
      fileBtn.style.display = "block";

      messageContainer.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach((msg) => {
          const messageElement = document.createElement("div");
          messageElement.dataset.id = msg.id;
          messageElement.classList.add("message");

          if (msg.userId == uid) {
            messageElement.classList.add("right");
          } else {
            messageElement.classList.add("left");
          }

          // Check if the message contains a file URL
          if (msg.fileUrl) {
            const fileLink = document.createElement("a");
            fileLink.href = msg.fileUrl;
            fileLink.textContent = msg.fileName;
            fileLink.download = msg.fileName;
            messageElement.appendChild(fileLink);
          } else {
            // Handle text message display
            messageElement.innerHTML = `<strong>${msg.userId == uid ? "You" : msg.User.name}</strong><br>${msg.message}`;
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


//Variable to Extract adminId of logged account
//let loggedAdminId ;

// Loading groups
async function loadGroups() {
  try {
    const response = await axios.get(`http://${ip}:${port}/groups/getGroups`, {
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
      groupItem.addEventListener("click", () =>
        joinGroupChat(group.id, group.name)
      );
      groupList.appendChild(groupItem);
      groupContainer.appendChild(groupList);
    });
  } catch (error) {
    console.log(error);
  }
}

//Join group chat
async function joinGroupChat(groupId, groupName) {
  currentGroupId = groupId;
  await getUserMessages(groupId);

  const currentGRoup = document.getElementById("current-group-name");
  currentGRoup.innerText = groupName;

  if (groupAdmin === uid) {
    currentGRoup.style.cursor = "pointer";
    currentGRoup.addEventListener("click", groupUsers(currentGroupId));
  }
  showMessages(groupId);
}

function groupUsers(groupId) {
  // Create a modal element
  const modal = document.createElement("div");
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.zIndex = "1";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.overflow = "auto";
  modal.style.backgroundColor = "rgba(0,0,0,0.4)"; // Black w/ opacity

  // Modal content container
  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#fefefe";
  modalContent.style.margin = "15% auto";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "20px";
  modalContent.style.width = "50%";

  // Close button for the modal
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.color = "red";
  closeButton.style.float = "right";
  closeButton.style.fontSize = "28px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.border = "none";
  closeButton.style.background = "none";
  closeButton.onclick = function () {
    modal.style.display = "none";
  };

  // Append close button to modal content
  modalContent.appendChild(closeButton);

  // Leaderboard title
  const title = document.createElement("h2");
  title.innerText = "Group Members";
  modalContent.appendChild(title);

  // Input field and button for adding a new member
  const addMemberDiv = document.createElement("div");
  addMemberDiv.className = "mb-3";

  const newMemberInput = document.createElement("input");
  newMemberInput.type = "text";
  newMemberInput.className = "form-control";
  newMemberInput.placeholder = "Enter member's mobile number";
  newMemberInput.id = "new-member-input";

  const addMemberButton = document.createElement("button");
  addMemberButton.className = "btn btn-primary mt-2";
  addMemberButton.innerText = "Add New Member";
  addMemberButton.onclick = async () => {
    const newMemberMobile = newMemberInput.value.trim();
    if (!newMemberMobile) {
      alert("Please enter a valid mobile number.");
      return;
    }

    try {
      const response = await axios.post(
        `http://${ip}:${port}/groups/addMember`,
        { groupId, mobile: newMemberMobile },
        { headers: { Authorization: token } }
      );

      if (response.status === 201) {
        alert("Member added successfully!");
        // Optionally, refresh the member list
        inputElement.click();
      } else {
        alert("Failed to add member.");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member. Please try again.");
    }
  };

  addMemberDiv.appendChild(newMemberInput);
  addMemberDiv.appendChild(addMemberButton);
  modalContent.appendChild(addMemberDiv);

  // Members list container
  const memberList = document.createElement("ul");
  memberList.id = "leaderboard";
  memberList.className = "list-group";
  modalContent.appendChild(memberList);

  // Append modal content to modal
  modal.appendChild(modalContent);

  // Append modal to document body
  document.body.appendChild(modal);

  // Button to show the members
  const inputElement = document.getElementById("current-group-name");
  inputElement.type = "button";
  inputElement.className = "nav-link";
  inputElement.value = "Group members";
  inputElement.style.fontWeight = "bold";
  inputElement.style.fontSize = "20px";
  inputElement.onclick = async () => {
    modal.style.display = "block"; // Show the modal

    try {
      // Fetch group members
      const response = await axios.get(
        `http://${ip}:${port}/groups/getGroups/${groupId}`,
        { headers: { Authorization: token } }
      );
      const groupMembers = response.data.GroupMembers;
      // Clear previous group members entries
      memberList.innerHTML = "";

      groupMembers.forEach((members) => {
        const user = members.User;
        const listItem = document.createElement("li");
        listItem.className =
          "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerText = user.name;

        // Original "Remove" button functionality
        const removeButton = document.createElement("button");
        removeButton.className = "btn btn-danger btn-sm";
        removeButton.innerText = "Remove";
        const userToRemove = user.id;
        removeButton.onclick = async () => {
          if (
            confirm(
              `Are you sure you want to remove ${user.name} from the group?`
            )
          ) {
            try {
              await axios.delete(
                `http://${ip}:${port}/groups/removeUser/${groupId}/${userToRemove}`,
                { headers: { Authorization: token } }
              );
              listItem.remove(); // Remove the user from the list
            } catch (error) {
              console.error("Error removing user:", error);
              alert("Failed to remove user. Please try again.");
            }
          }
        };

        // Dropdown for additional actions
        const dropdownContainer = document.createElement("div");
        dropdownContainer.className = "dropdown";

        // Ellipsis button
        const ellipsisButton = document.createElement("button");
        ellipsisButton.className = "btn btn-light dropdown-toggle";
        ellipsisButton.innerHTML =
          '<i class="fa-solid fa-ellipsis-vertical"></i>';
        ellipsisButton.setAttribute("data-bs-toggle", "dropdown");
        ellipsisButton.setAttribute("aria-expanded", "false");

        // Dropdown menu
        const dropdownMenu = document.createElement("ul");
        dropdownMenu.className = "dropdown-menu";

        // Make Admin button in dropdown
        const makeAdminItem = document.createElement("li");
        const makeAdminButton = document.createElement("button");
        makeAdminButton.className = "dropdown-item";
        makeAdminButton.innerText = "Make Admin";
        const userToMakeAdmin = user.id;

        makeAdminButton.onclick = async () => {
          if (
            confirm(
              `Are you sure you want to make admin ${user.name} of this group?`
            )
          ) {
            try {
              await axios.post(
                `http://${ip}:${port}/groups/makeAdmin/${groupId}/${userToMakeAdmin}`,
                { headers: { Authorization: token } }
              );
            } catch (error) {
              console.error("Error making user admin:", error);
              alert("Failed to make user admin. Please try again.");
            }
          }
        };

        ////
        makeAdminItem.appendChild(makeAdminButton);

        // Remove button in dropdown
        const removeItem = document.createElement("li");
        const dropdownRemoveButton = document.createElement("button");
        dropdownRemoveButton.className = "dropdown-item text-danger";
        dropdownRemoveButton.innerText = "Remove";
        dropdownRemoveButton.onclick = removeButton.onclick; // Use the same remove functionality
        removeItem.appendChild(dropdownRemoveButton);

        // Add items to dropdown menu
        dropdownMenu.appendChild(makeAdminItem);
        dropdownMenu.appendChild(removeItem);

        // Add dropdown to container
        dropdownContainer.appendChild(ellipsisButton);
        dropdownContainer.appendChild(dropdownMenu);

        // Append dropdown container to the list item
        listItem.appendChild(dropdownContainer);

        // Append the list item to the leaderboard
        memberList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };
}

// Logout user
function logOut() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
