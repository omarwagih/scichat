setupLandingPage = function(){
  uid = firebase.auth().currentUser.uid;

  if(!uid){
    alert('Whoops!')
    return;
  }

  console.log('-- fetching user data: ' + uid)
  firebase.database().ref('/user_data/' + uid).once('value').then(function(snapshot) {
    d = snapshot.val();
    // Set the UID
    d.uid = uid;

    console.log(d);
    window.user_data = d;

    $('#landing_sci,#landing_nonsci').hide();
    if(d.is_sci){
      $('#landing_sci').slideDown();
    }else{
      $('#landing_nonsci').slideDown();
    }
    // ...
  });

}



$('.pair-me').click(function(){
  initPeer();
  $('#landing_page').hide();
  //$('#chatbox').show();
  $('#wait_pair').show();

});

$('#cancel-pair').click(function(){
  
  $('#landing_page').show();
  //$('#chatbox').hide();
  $('#wait_pair').hide();

  peer.destroy();

  // Remove users from database pool
  removeUserFromPool();
});

$(document).ready(function(){



});