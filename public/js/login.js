// User login
async function login(event) {
    event.preventDefault();
    const userEmail = document.getElementById('email').value;
    const userPass = document.getElementById('password').value;

    try {
        const response = await axios.post('http://localhost:3000/user/login', {
            email: userEmail,
            password: userPass
        });
    
        alert(response.data.message);
        console.log("Login success");
    
    } catch (error) {
        alert("Wrong email or password");
        document.body.innerHTML += '<center><h4>Something Went Wrong</h4></center>';
        console.error(error);
    }

    // Clear the input fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
};
