var examCodes = [];
var examCodesTeacher = [];
var stopEnter = false;

firebase.database().ref('exam-codes').on('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    examCodes.push(childSnapshot.val().split(";")[0]);
    examCodesTeacher.push(childSnapshot.val().split(";")[1]);
  });
});

function onSignIn(googleUser) {
  if(document.URL.indexOf("?") == -1 && document.URL.substring(document.URL.indexOf('?') + 1) != "noRedirect"){
    window.location = "teacher.html";

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


//function to remove all class='active'
function removeAllActive() {
  document.getElementsByTagName("LI")[0].className = "";
  document.getElementsByTagName("LI")[1].className = "";
}

//function to switch displays based on what user clicks
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

// function to retieve and analyze code
function submitExamCode() {
  var code = document.getElementById('inputExamCode').value.toUpperCase();

  if(isValid(code)) {
    localStorage.setItem('ExamCode', code);
    document.getElementById('main').style.display = "none";
    document.getElementById('navigation').style.display = "none";
    displayQuiz(code, examCodesTeacher[examCodes.indexOf(code)]);
    stopEnter = true;
  }
  else {
    if(code.length > 0) {
      swal("Invalid exam code!", "Check for special characters and make sure the length is at least 5", "error");
    }
  }
}

//function to make sure exam code is valid
function isValid(code) {
  return examCodes.indexOf(code) != -1 && code.length == 5 && (!/[~!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(code));
}

// function to display quiz to student
function displayQuiz(code, teacher) {
  console.log(code, teacher);
  toggleFullScreen();
}

//toggleFullScreen
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  }
  else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

//code to call when document leaves full screen
document.onfullscreenchange = function ( event ) {
  if(document.fullscreenElement == null) {
    var time = 5;
    var x = setInterval(function(){
        if(time != 0) {
          time--;
        }
        else {
          clearInterval(x);
          endTest();
        }
     }, 1000);


    swal({
      title: "Are you sure?",
      text: "Once you leave the test, you can no longer come back. Your final score will be recorded. YOU HAVE " + time + " SECONDS BEFORE THIS AUTOMATICALLY CLOSES AND ENDS TEST",
      icon: "warning",
      buttons: ["Take me back!", "Ok, end my test"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        swal("Success! Your score has been recorded and sent to your teacher!", {
          icon: "success",
        });
      } else {
        toggleFullScreen();
      }
    });
  }
};

window.onbeforeunload = function() {
   return "Dude, are you sure you want to leave? Think of the kittens!";
}

// if user hits enter, check exam code
document.addEventListener("keypress", function(e) {
  if (e.keyCode === 13 && !stopEnter) {
    console.log("hello");
    submitExamCode();
  }
}, false);
