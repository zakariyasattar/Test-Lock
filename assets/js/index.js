var examCodes = [];
var stopEnter = false;
var key = initKey();

// var data;
// 	$.ajax({
// 	  type: "GET",
// 	  url: "data.csv",
// 	  dataType: "text",
// 	  success: function(response)
// 	  {
//   		data = $.csv.toArrays(response);
//       for(var i = 0; i < data.length; i++){
//         var id = data[i][0];
//         var name = data[i][3] + " " + data[i][2];
//         var className = data[i][10];
//
//         firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className + "/Students").push(id + ";" + name);
//         firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className + "/Exams/Hello/").push(name + ":" + Math.floor((Math.random() * 25) + 75));
//         //firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className).remove();
//       }
// 	  }
// });

// pull all exam codes then encrypt them
firebase.database().ref('exam-codes').on('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    var code = CryptoJS.AES.encrypt(childSnapshot.val(), key);
    examCodes.push(code);
  });
});

// code to run when google user signs in
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

// request signout
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    localStorage.removeItem('userInfo')
  });
}

function initKey() {
  var finalString;
  var i, arr = [];
  for (i = 0; i < 25; i++) {
      arr[i] = i + 1;
  }
  arr.sort(function () {
      return Math.random() - 0.25;
  });

  for(var j = 0; j < arr.length; j++) {
    finalString = arr[j] + finalString + "";
  }
  return finalString.replace('NaN', '');
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
    var i = 0;
    localStorage.setItem('ExamCode', code);
    document.getElementById('main').style.display = "none";
    document.getElementById('navigation').style.display = "none";

    for(var x = 0; x < examCodes.length; x++){
      var decryptedBytes = CryptoJS.AES.decrypt(examCodes[x], key);
      var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if(plaintext.split(";")[0] == code){
        i = x;
        break;
      }
    }

    var teacher = CryptoJS.AES.decrypt(examCodes[i], key);
    var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    displayQuiz(code, plaintext.split(";")[1]);
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
  var exists = false;

  for(var x = 0; x < examCodes.length; x++){
    var decryptedBytes = CryptoJS.AES.decrypt(examCodes[x], key);
    var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if(plaintext.split(";")[0] == code){
      exists = true;
    }
  }

  return exists && code.length == 5 && (!/[~!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(code));
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

//function to end test
function endTest() {
  window.location.href = window.location.href;
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

// window.onbeforeunload = function() {
//    return "Dude, are you sure you want to leave? Think of the kittens!";
// }

// if user hits enter, check exam code
document.addEventListener("keypress", function(e) {
  if (e.keyCode === 13 && !stopEnter) {
    submitExamCode();
  }
}, false);

key = "";
