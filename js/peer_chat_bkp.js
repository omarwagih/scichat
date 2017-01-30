

var getPoolAddress = function(w){
  return 'user_pool/' + tag +'/'+ user_id;
}

var removeUserFromPool = function(){
  // If academic no need to deal with pool
  if(!is_pub) return;

  console.log('-- removing user from pool: ' + getPoolAddress())
  firebase.database().ref( getPoolAddress() ).remove();
}


var doPairingHelper = function(){

  $('#status').text('Trying to pair...');
  firebase.database().ref( 'user_pool/'+tag ).limitToFirst(1)
  .once('value').then(function(snapshot) {
    user_match = snapshot.val();
    
    if(user_match){
      clearInterval( window.myinterval );
      window.found_match = true;
      console.log(user_match);
      k = Object.keys(user_match)[0];
      peer_id = user_match[k].id;

      // Connect
      $('#rid').val(peer_id);
      $('#connect').click();
    }

  });

  
}

var doPairing = function(){
  window.myinterval = setInterval(doPairingHelper, 2000);
}



// Connect to PeerJS, have server assign an ID instead of providing one
// Showing off some of the configs available with PeerJS :).
var peer = new Peer({
  // Set API key for cloud server (you don't need this if you're running your
  // own.
  key: 'z6r01o763ev4e7b9',

  // Set highest debug level (log everything!).
  debug: 3,

  // Set a logging function:
  logFunction: function() {
    var copy = Array.prototype.slice.call(arguments).join(' ');
    $('.log').append(copy + '<br>');
  }
});

var connectedPeers = {};


// Show this peer's ID.
peer.on('open', function(id){
  $('#pid').text(id);

  // user_id = prompt("User ID: ", "jdoe");
  // is_pub_char = prompt("Are you an academic?", "y/n");
  // tag = prompt("What field are you interested in?", "e.g. cancer");

user_id = 'omarwagih';
is_pub_char = 'y'
tag = 'cancer'
  
    console.log('-- is_pub_char=' + is_pub_char)
    is_pub = true
    if(is_pub_char == 'y') is_pub = false
    console.log('-- is_pub=' + is_pub)

  if(is_pub){
    console.log('-- public user')
    // Add public user to pool
    console.log('-- adding user to pool: ' + getPoolAddress())
    firebase.database().ref( getPoolAddress() ).set({
      tag : tag,
      id: id
    });
  }else{
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





// Handle a connection object.
function connect(c) {
  // Handle a chat connection.
  if (c.label === 'chat') {
    var chatbox = $('<div></div>').addClass('connection').addClass('active-conn').attr('id', c.peer);

    var header = $('<h6></h6>').html('Chat with <strong>' + c.peer + ' has begun</strong>');
    var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
    chatbox.append(header);
    chatbox.append(messages);


    $('.filler').hide();
    $('#pairing-wrap').hide();
    $('#connections').append(chatbox);

    c.on('data', function(data) {
      messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data + '</div>');
    });

    c.on('close', function() {
      
      // Remove users from database pool
      removeUserFromPool();
      
      alert(c.peer + ' has left the chat.');
      chatbox.remove();
      
      if ($('.connection').length === 0) {
        $('.filler').show();
        $('#pairing-wrap').show();
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
        metadata: {message: 'hi i want to chat with you!'}
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
      // Remove users from database pool
      removeUserFromPool();

      c.close();
    });
  });


  $('#send').submit(function(e) {
    e.preventDefault();
    // For each active connection, send the message.
    var msg = $('#text').val();
    eachActiveConnection(function(c, $c) {
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

    // Remove users from database pool
    removeUserFromPool();
  }
};
