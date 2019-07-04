var examCodes = [], students = [];
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
//         //firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className + "/Students").push(id + ";" + name);
//         //firebase.database().ref("Students").push(id + ";" + name);
//         firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className + "/Exams/NJFIJ/responses").push(name + ":" + Math.floor((Math.random() * 25) + 75) + ":" + Math.floor((Math.random() * 5) + 15));
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

// pull all students then encrypt them
firebase.database().ref('Students').on('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    // no need for encryption because no active storage
    students.push(childSnapshot.val());
  });
});

// code to run when google user signs in
function onSignIn(googleUser) {
  if(document.URL.indexOf("?") == -1){
    window.location = "teacher.html";

    var profile = googleUser.getBasicProfile();
    localStorage.setItem("userInfo", JSON.stringify([profile.getId(), profile.getName(), profile.getImageUrl(), profile.getEmail()]));
  }
  else {
    window.location.href = document.URL.substring(0, document.URL.indexOf("?"));
    localStorage.setItem("userInfo", "");
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

//initialize key with random val
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
  document.getElementsByTagName("LI")[2].className = "";
}

// remove dropdown if screen size can handle navbar
function removeDropDown(x) {
 if (x.matches) { // If media query matches
   document.getElementById('dropdown').style.display = "none";
 } else {
   document.getElementById('dropdown').style.display = "initial";
 }
}

var x = window.matchMedia("(min-width: 601px)")
removeDropDown(x) // Call listener function at run time
x.addListener(removeDropDown) // Attach listener function on state changes


//function to switch displays based on what user clicks
function display(title) {
  if(title == '<a href="#">Ping-Pong</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "initial";
    document.getElementById('leaderboard').style.display = "none";
  }
  else if(title == '<a href="#">Home</a>') {
    document.getElementById('main').style.display = "initial";
    document.getElementById('pong').style.display = "none";
    document.getElementById('leaderboard').style.display = "none";
    document.body.style.background = '#1b1b1d';
  }
  else if(title == '<a href="#">Leaderboard</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "none";
    document.getElementById('leaderboard').style.display = "initial";
    document.body.style.background = 'white';
    populateLeaderboard();
  }
}

function getStudent(id) {
  students = mergeSort(students);
  //binary search for finding ID pos
  var low  = 0 , high = students.length -1 ,mid ;
  while (low <= high){
      mid = Math.floor((low+high)/2);
      if(students[mid].split(";")[0]==id) return students[mid];
      else if (students[mid].split(";")[0]<id) low = mid+1;
      else high = mid-1;
  }
  return -1 ;
}

//implement merge sort
function mergeSort (arr) {
  if (arr.length === 1) {
    // return once we hit an array with a single item
    return arr
  }

  const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
  const left = arr.slice(0, middle) // items on the left side
  const right = arr.slice(middle) // items on the right side

  return merge(
    mergeSort(left),
    mergeSort(right)
  )
}

// compare the arrays item by item and return the concatenated result
function merge (left, right) {
  let result = []
  let indexLeft = 0
  let indexRight = 0

  while (indexLeft < left.length && indexRight < right.length) {
    if (left[indexLeft].split(";")[0] < right[indexRight].split(";")[0]) {
      result.push(left[indexLeft])
      indexLeft++
    } else {
      result.push(right[indexRight])
      indexRight++
    }
  }

  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
}

// function to retieve and analyze code
function submitExamCode() {
  var code = document.getElementById('inputExamCode').value.toUpperCase();
  var data = findCode(code);

  if(code.length == 5 && (!/[~!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(code))) {
    document.getElementById('exam-info').innerHTML = "";
    if(data == null) {
      swal("Invalid exam code!", "Check for special characters and make sure the length is at least 5", "error");
    }

    else if(data.split(";")[0] == code) {
      document.getElementById('exam-info').innerHTML = data.split(";")[3] + " | " + data.split(";")[2];
      document.getElementById('id-input').style.display = 'initial';

      localStorage.setItem('ExamCode', code);
      stopEnter = true;
    }
  }
}

function retrieveName() {
  var id = document.getElementsByClassName("ID")[0].value;

  if(id.length == 5){
    var i = 0;
    for(var x = 0; x < examCodes.length; x++){
      var decryptedBytes = CryptoJS.AES.decrypt(examCodes[x], key);
      var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if(plaintext.split(";")[0] == localStorage.getItem('ExamCode')){
        i = x;
        break;
      }
    }

    var teacher = CryptoJS.AES.decrypt(examCodes[i], key);
    var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    document.getElementById('userName').innerHTML = "";

    firebase.database().ref("Teachers/" + plaintext.split(";")[1] + "/Classes/" + plaintext.split(";")[2] + "/Students").once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.val().split(";")[0] == id) {
          document.getElementById('userName').innerHTML = childSnapshot.val().split(";")[1];
          document.getElementById('proceed').style.display = "initial";
          document.getElementById('recognition').style.bottom = "-10px";
        }
      });
    });

    if(document.getElementById('userName').innerHTML == "") {
      document.getElementById('userName').innerHTML = "Not Found!"
    }
  }
}

//function to make sure exam code is valid
function findCode(code) {
  var exists = false;
  var data = "";

  for(var x = 0; x < examCodes.length; x++){
    var decryptedBytes = CryptoJS.AES.decrypt(examCodes[x], key);
    var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if(plaintext.split(";")[0] == code){
      return plaintext;
    }
  }

  return null;
}

// function to display quiz to student
function displayQuiz(code) {
  var i = 0;

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

  document.getElementById('main').style.display = "none";
  document.getElementById('navigation').style.display = "none";
  toggleFullScreen();
}

//toggleFullScreen
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.addEventListener('contextmenu', event => event.preventDefault());
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
    let timerInterval;
    Swal.fire({
      title: 'Are You Sure You Want To Leave?',
      html: 'You have <strong></strong> seconds to go back to your test or the test ends and your score is recorded!',
      confirmButtonText: 'Yes, end it!',
      cancelButtonText: 'No, Go Back!',
      showCancelButton: true,
      showConfirmButton: true,
      allowEscapeKey: false,
      allowEnterKey: false,
      timer: 10000,
      onBeforeOpen: () => {
        timerInterval = setInterval(() => {
          Swal.getContent().querySelector('strong')
            .textContent = Swal.getTimerLeft() / 1000
        }, 100)
      },
      onClose: () => {
        clearInterval(timerInterval)
      }
      }).then((result) => {
        if (!result.value) {
          toggleFullScreen();
        }
        else if(result.value) {
          endTest();
        }
        if (
          // Read more about handling dismissals
          result.dismiss === Swal.DismissReason.timer
        ) {
          endTest();
        }
      });
    };
  }

// window.onbeforeunload = function() {
//    return "Dude, are you sure you want to leave? Think of the kittens!";
// }

// if user hits enter, check exam code
document.addEventListener("keypress", function(e) {
  if (e.keyCode === 13 && !stopEnter) {
    submitExamCode();
  }
}, false);

//throw key away
key = "";
