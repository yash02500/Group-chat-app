
const ip = '54.221.172.47';
const port= '3000';

// User signup
async function addUser(event){
    try{
        event.preventDefault();

        const userName = document.getElementById('name').value;
        const userEmail = document.getElementById('email').value;
        const userMob = document.getElementById('mobile').value;
        const userPass = document.getElementById('password').value;

        const response = await axios.post(`http://${ip}:${port}/user/signup`, {
            name: userName,
            email: userEmail,
            mobile: userMob,
            password: userPass
        });
       
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('mobile').value = '';
        document.getElementById('password').value = '';

        console.log("New User added");
        window.location.href="login.html";

    } catch (error) {
        if (error.response) {
          alert(error.response.data.message); // Display the error message from the backend
        } else {
          console.error('Something went wrong:', error);
        }
    }}      
