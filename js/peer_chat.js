

var getPoolAddress = function(w){
  return 'user_pool/' + tag +'/'+ user_id;
}

var removeUserFromPool = function(){
  // If academic no need to deal with pool
  if(!is_pub) return;

  console.log('-- removing user from pool: ' + getPoolAddress())
  firebase.database().ref( getPoolAddress() ).remove();
}

interest_i = 0;

var doPairingHelper = function(){
  console.log('-- doPairingHelper i='+interest_i + ' ' + interests[interest_i])
  $('#status').text('Trying to pair...');

  cur_interest = interests[interest_i]
  if(!cur_interest){
    console.log('!! break recurse wait for some time and try again. gonna return');
    interest_i = 0;
    return;
  }
  firebase.database().ref( 'user_pool/'+cur_interest ).limitToFirst(1)
  .once('value').then(function(snapshot) {
    user_match = snapshot.val();
    
    if(user_match){
      clearInterval( window.myinterval );
      window.found_match = true;
      console.log(user_match);
      k = Object.keys(user_match)[0];
      peer_id = user_match[k].id;

      console.log('-- user match k='+k)
      // k is our uid
      // fetch the users data and update chat box
      firebase.database().ref( 'user_data/'+k ).once('value').then(function(snapshot) {
        var c = snapshot.val();
        window.peer_data = c;
        console.log('-- c=')
        console.log(c);
        $('#chatbox-title').text('You are chatting with anonymous ' + c.occupation.toLowerCase() + ' aged ' + c.age);
      });
      

      // Connect
      $('#rid').val(peer_id);
      $('#connect').click();
    }else{
      console.log('-- NO MATCH incr interest_i and trying again')
      interest_i++;
      doPairingHelper();
    }

  });

  
}

var doPairing = function(){
  window.myinterval = setInterval(doPairingHelper, 5000);
}

var connectedPeers = {};
peer = null;
peer_opened = false;


initPeer = function(){
  // Connect to PeerJS, have server assign an ID instead of providing one
  // Showing off some of the configs available with PeerJS :).
  // peer = new Peer({
  //   // Set API key for cloud server (you don't need this if you're running your
  //   // own.
  //   key: 'lkciswqtzj7l23xr',

  //   // Set highest debug level (log everything!).
  //   debug: 3,

  //   // Set a logging function:
  //   logFunction: function() {
  //     var copy = Array.prototype.slice.call(arguments).join(' ');
  //     $('.log').append(copy + '<br>');
  //   }
  // });
  
 window.peer = new Peer({　host:'gtc-peerjs.herokuapp.com', secure:true, port:443, debug: 3})

  // Show this peer's ID.
  peer.on('open', function(id){

    peer_opened = true;
  $('#pid').text(id);

  user_id = user_data.uid;
  is_pub = !user_data.is_sci
    
      console.log('-- is_pub=' + is_pub)

    if(is_pub){

      window.tag = $('#selected_topic').val();
      console.log('-- public user')
      // Add public user to pool
      console.log('-- adding user to pool: ' + getPoolAddress())
      firebase.database().ref( getPoolAddress() ).set({
        tag : tag,
        id: id
      });

    }else{
      window.interests = user_data.interests;
      console.log('-- academic')
      // Academic - do pairing
      doPairing();

    }
    

  });

  // Await connections from others
  peer.on('connection', connect);


  // On peer error 
  peer.on('error', function(err) {
    console.log(err);
  });

}


endChat = function(){
  $('.filler').show();
        
  $('#landing_page').show();
  $('#chatbox').hide();
  $('#wait_pair').hide();

  removeUserFromPool();
}

// Handle a connection object.
function connect(c) {

  console.log('-- connect called')
  // Handle a chat connection.
  if (c.label === 'chat') {
    var chatbox = $('<div></div>').addClass('connection').addClass('active-conn').attr('id', c.peer);

    var header = $('<h6></h6>').html('Chat with <strong>' + c.peer + ' has begun</strong>');
    var messages = $('<div><em>Connected</em></div>').addClass('messages');
    //chatbox.append(header);
    chatbox.append(messages);

    // Set chatbox title
    if(!user_data.is_sci){
      $('#chatbox-title').text('You are chatting with anonymous ' + c.metadata.position + ' in ' + tag);
    }

    $('.filler').hide();
    $('#chatbox').show();
    $('#wait_pair').hide();
    $('#connections').append(chatbox);

    // Remove users from database pool once connected
    removeUserFromPool();

    c.on('data', function(data) {
      //messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data + '</div>');
      messages.append('<div><span class="peer">Them</span>: ' + data + '</div>');
    });

    c.on('close', function() {
      
      alert(c.peer + ' has left the chat.');
      chatbox.remove();
      
      if ($('.connection').length === 0) {
        endChat();
      }
      
      delete connectedPeers[c.peer];
    });
  }
  connectedPeers[c.peer] = 1;
}

$(document).ready(function() {
  
  function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
  }

  // Connect to a peer
  $('#connect').click(function() {
    var requestedPeer = $('#rid').val();

    if (!connectedPeers[requestedPeer]) {

      // Create 2 connections, one labelled chat and another labelled file.
      var c = peer.connect(requestedPeer, {
        label: 'chat',
        serialization: 'none',
        metadata: {
          message: 'hi i want to chat with you!', 
          position: user_data.position,
          interests: user_data.interests
        }
      });

      c.on('open', function() {
        connect(c);
      });

      c.on('error', function(err) { 

        alert(err); 
      });
    }
    connectedPeers[requestedPeer] = 1;
  });

  // Close a connection.
  $('#close').click(function() {
    eachActiveConnection(function(c) {
      c.close();
    });
    endChat();

  });


  $('#send').submit(function(e) {
    e.preventDefault();
    // For each active connection, send the message.
    var msg = $('#text').val();
    eachActiveConnection(function(c, $c) {
      console.log('-- recieved msg ...!')
      console.log(c)

      if (c.label === 'chat') {
        c.send(msg);
        $c.find('.messages').append('<div><span class="you"><strong>You: </strong></span>' + msg
          + '</div>');
      }
    });
    $('#text').val('');
    $('#text').focus();
  });


  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    var actives = $('.active-conn');
    var checkedIds = {};
    actives.each(function() {
      var peerId = $(this).attr('id');

      if (!checkedIds[peerId]) {
        var conns = peer.connections[peerId];
        for (var i = 0, ii = conns.length; i < ii; i += 1) {
          var conn = conns[i];
          fn(conn, $(this));
        }
      }

      checkedIds[peerId] = 1;
    });
  }

});

// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();

    endChat();
  }
};
