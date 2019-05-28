function onSignIn(googleUser) {
  if(document.URL.indexOf("?") == -1 && document.URL.substring(document.URL.indexOf('?') + 1) != "noRedirect"){
    window.location = "assets/html/teacher.html";

    var profile = googleUser.getBasicProfile();
    localStorage.setItem("userInfo", JSON.stringify([profile.getId(), profile.getName(), profile.getImageUrl(), profile.getEmail()]));
  }
  else {
    window.location.href = document.URL.substring(0, document.URL.indexOf("?"));
    signOut();
  }
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    localStorage.removeItem('userInfo')
  });
}

function removeAllActive() {
  document.getElementsByTagName("LI")[0].className = "";
  document.getElementsByTagName("LI")[1].className = "";
  document.getElementsByTagName("LI")[2].className = "";
}

function display(title) {
  if(title == '<a href="#">Ping-Pong</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "initial";
  }
  else if(title == '<a href="#">Home</a>') {
    document.getElementById('main').style.display = "initial";
    document.getElementById('pong').style.display = "initial";
  }
}
