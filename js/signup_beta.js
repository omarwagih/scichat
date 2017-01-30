//Get elements
user_attrs = null

const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const inputPasswordConfirm = document.getElementById('inputPasswordConfirm');
const inputEmail_2 = document.getElementById('inputEmail_2');
const inputPassword_2 = document.getElementById('inputPassword_2');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

$('#inputPassword, #inputPasswordConfirm').on('keyup', function () {
    if ($('#inputPassword').val() == $('#inputPasswordConfirm').val()) {
        $('#message').html('Matching').css('color', 'green');
    } else{
        $('#message').html('Not Matching').css('color', '#e6550d');
    }

    if ( String($('#inputPassword').val()).length < 6 || String($('#inputPasswordConfirm').val()).length <6){
      $('#message2').html('<br/>Passwords must be at least 6 characters').css('color', '#e6550d');
    } else{
      $('#message2').html('')
    }
});

//Add login event
btnLogin.addEventListener('click', e => {
  // Get email and pass
  const email = inputEmail_2.value;
  const pass = inputPassword_2.value;
  const auth = firebase.auth();

  //Sign in
  const promise = auth.signInWithEmailAndPassword(email, pass);
  promise.catch(e => console.log(e.message));

});

// Add Sign Up event
btnSignUp.addEventListener('click', e => {
  // Get email and pass
  // TODO: check for real emails
  const email = inputEmail.value;
  const pass = inputPassword.value;
  const auth = firebase.auth();


  //Sign up
  const promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.catch(e => console.log(e.message));
        //  .then(user => console.log(user))


  var userType = $('#userType').val();
  if(userType == 'public'){
    user_attrs = {
          is_sci: false,
          age: $('#age').val(),
          occupation: $('#occupation :selected').text()
        }
  } else{ // scientist

    var allVals = [];
    $('#areainterest').find('input:checked').each(function() {
      allVals.push($(this).val());
    });

    user_attrs = {
          is_sci: true,
          research_field: $('#ResearchField :selected').text(),
          position: $('#Position :selected').text(),
          interests: allVals
    }
  }
  console.log(user_attrs);

});

btnLogout.addEventListener('click', e => {
  firebase.auth().signOut();
  alert("You have logged out - you'll be redirected to the home page now")
  $('#landing-page-nav').parent().hide();
  $('#login-nav').parent().hide();
  $('#signup-nav').parent().hide();
  $('#home-nav').click();
});


// Add a realtime listener
firebase.auth().onAuthStateChanged(function(user) {
  if(user != null){

    // Unhide logout button
    console.log(user);
    btnLogout.classList.remove('hide');

    if(!user.emailVerified){
      user.sendEmailVerification();
    }

    if(user_attrs){
      console.log('-- found user_attrs, writing to firebase')
      uid = user.uid;
      firebase.database().ref('user_data/'+uid).set(user_attrs);

    }

    // Redirect to landing page
    if(firebase.auth().currentUser) $('#landing-page-nav').click().parent().show();
    $('#login-nav').parent().hide();
    $('#signup-nav').parent().hide();

    setupLandingPage();

  }else{
    //alert('You are not logged in!');
    console.log('not logged in');
    btnLogout.classList.add('hide');
    $('#login-nav').parent().show();
    $('#signup-nav').parent().show();
  }


});

firebase.auth().onAuthStateChanged(function(user) {
  if(user != null){
    (user.emailVerified) ? console.log('Email is verified') : console.log('Email is not verified')
  }
});
