//Get elements

const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

//Add login event
btnLogin.addEventListener('click', e => {
  // Get email and pass
  const email = txtEmail.value;
  const pass = txtPassword.value;
  const auth = firebase.auth();

  //Sign in
  const promise = auth.signInWithEmailAndPassword(email, pass);
  promise.catch(e => console.log(e.message));

});

// Add Sign Up event
btnSignUp.addEventListener('click', e => {
  // Get email and pass
  // TODO: check for real emails
  const email = txtEmail.value;
  const pass = txtPassword.value;
  const auth = firebase.auth();

  //Sign up
  const promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.catch(e => console.log(e.message));
         //.then(user => console.log(user))

});

btnLogout.addEventListener('click', e => {
  firebase.auth().signOut();
});


// Add a realtime listener
firebase.auth().onAuthStateChanged(firebaseUser => {

  if(firebaseUser) {
    console.log(firebaseUser);
    btnLogout.classList.remove('hide');
  } else{
    console.log('not logged in');
    btnLogout.classList.add('hide');
  }

});

firebase.auth().onAuthStateChanged(function(user) {
  if(user != null){
    if(!user.emailVerified){
      user.sendEmailVerification();
    }
  }
});

firebase.auth().onAuthStateChanged(function(user) {
  if(user != null){
    (user.emailVerified) ? console.log('Email is verified') : console.log('Email is not verified')
  }
});
