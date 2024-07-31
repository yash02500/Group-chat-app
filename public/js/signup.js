// User signup
async function addUser(event){
    try{
        event.preventDefault();

        const userName = document.getElementById('name').value;
        const userEmail = document.getElementById('email').value;
        const userMob = document.getElementById('mobile').value;
        const userPass = document.getElementById('password').value;

        const response = await axios.post('http://localhost:3000/user/signup', {
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

    } catch(error){
        document.body.innerHTML=document.body.innerHTML+'<h4>Something Went Wrong</h4>';
        console.log(error);
    }
}
