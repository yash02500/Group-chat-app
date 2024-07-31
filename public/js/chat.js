const token = localStorage.getItem("token");

// parse jwt
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

//Stored parsed jwt into variable
const decode = parseJwt(token);

// Extracting name from token
const username = decode.name;
const uid = decode.userId;

document.addEventListener("DOMContentLoaded", function () {
  if (!token) {
    alert("You need to login first");
    window.location.href = "login.html";
  }

  showMessages();

  //Socket io connection
  const socket = io("http://localhost:8000");
  const form = document.getElementById("send");
  const message = document.getElementById("message");
  const messageContainer = document.querySelector(".container");

  const append = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerHTML = message;
    messageElement.classList.add("message");
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = message.value;
    append(`<strong>You</strong><br> ${userMessage}`, "right");
    socket.emit("send", userMessage);

    //User message object
    const saveUserMessage = {
      message: userMessage,
      userId: uid,
      name: username
    };

    //Sending user messages through api to database
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

  // Handling various Socket.io events: emitting new user joins, listening for user joins, message reception, and user departures
  socket.emit("new-user-joined", username);

  socket.on("user-joined", (name) => {
    append(`<strong>${name}</strong> joined the chat`, "right");
  });

  socket.on("receive", (data) => {
    append(`<strong>${data.name}</strong><br> ${data.message}`, "left");
  });

  socket.on("left", (name) => {
    append(`<strong>${name}</strong> left the chat`, "right");
  });
});

//Getting user messages
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


//Show user messages
// function showMessages() {
//   getUserMessages()
//     .then((data) => {
//       const right = document.getElementById("right");
//       right.innerHTML = "";

//       const left = document.getElementById("left");
//       left.innerHTML = "";

//       if (data && data.length > 0) {
//         data.forEach((msg) => {
//           if (msg.userId == uid) {
//             const message = document.createElement("div");
//             message.dataset.id = msg.id;
//             message.innerHTML = `
//                   <td>${msg.message}</td>`;
//             right.appendChild(message);
//           } else {
//             const message = document.createElement("div");
//             message.dataset.id = msg.id;
//             message.innerHTML = `
//                   <td>${msg.message}</td>`;
//             left.appendChild(message);
//           }
//         });
//       } else {
//         console.log("User messages missing");
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }


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
            messageElement.innerHTML = `<td><strong>You</strong><br>${msg.message}</td>`;
            messageElement.classList.add("right");
          } else {
            messageElement.innerHTML = `<td><strong>${msg.name}</strong><br>${msg.message}</td>`;
            messageElement.classList.add("left");
          }

          messageContainer.appendChild(messageElement);
        });
      } else {
        console.log("User messages missing");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}


//User Logout
function logOut() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
