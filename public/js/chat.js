
const token = localStorage.getItem('token');
if(!token){
    alert('You need to login first');
    window.location.href ="login.html";
}

//Stored parsed jwt into variable
const decode = parseJwt(token)

//user joining chat
const username= decode.name;
const joined = document.getElementById('joining');
const joinedUser = document.createElement('label');
joinedUser.innerHTML=username+" Joined the chat";
joined.appendChild(joinedUser);


// parse jwt
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


//User Logout
function logOut(){
    localStorage.removeItem('token');
    window.location.href="login.html";
}