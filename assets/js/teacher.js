// check if user is signed in
if(localStorage.getItem('userInfo') == null) {
  document.getElementById('body').style.display = "none";
  alert("NOT AUTHORIZED");
}


var examCodes = [];
var examCodesTeachers = [];
var arr = [];

//when page loads populateDashboard()
window.onload = function() {
  populateDashboard();
};

// retrieve userName from localStorage
var userName = (JSON.parse(localStorage.getItem("userInfo"))[1]);
var profileImg = (JSON.parse(localStorage.getItem("userInfo"))[2]);

//initialize aspects of page with JS data
document.getElementById('welcome-text').innerHTML = "Welcome " + userName + "!";
document.getElementById('profile').src = profileImg;

function createQuiz() {
  if(examCodes.length == 0){

    // Pull all exam codes and seperate the datapoint from each other
    firebase.database().ref('exam-codes').on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        examCodes.push(childSnapshot.val().split(";")[0]);
        examCodesTeachers.push(childSnapshot.val().split(";")[1])
      });
    });
  }

  // get randomCode
  var randomCode = generateCode();

}

// Generate random exam code
function generateCode() {
  var code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
  if(examCodes.indexOf(code) == -1){
    firebase.database().ref("exam-codes").push(randomCode.toUpperCase() + ";" + userName); //+ ";" + object.innerHTML);
    return code;
  }
  else {
    generateCode();
  }
}

// create div box for every class
function createClassBox(className) {
  var examReference = firebase.database().ref('Teachers/' + userName + "/Classes/" + className + "/Exams/");
  var studentReference = firebase.database().ref('Teachers/' + userName + "/Classes/" + className + "/Students/");

  var wrapper = document.getElementById('wrapper');

  var classBox = document.createElement('div');
  classBox.className = "classBox";

  var span = document.createElement('span');
  span.innerHTML = className;
  span.className = 'className';

  classBox.appendChild(span);
  classBox.appendChild(document.createElement('hr'));

  var numStudents = document.createElement('p');

  studentReference.once("value", function(students) {
    var lowKey = document.createElement('h6');
    lowKey.innerHTML = "Students";
    lowKey.id="lowKey";

    numStudents.innerHTML = students.numChildren();
    numStudents.appendChild(lowKey);
  });

  numStudents.id = "numStudents";
  classBox.appendChild(numStudents);

  var hrInBetween = document.createElement('hr');
  hrInBetween.id = "hrInBetween";
  classBox.appendChild(hrInBetween);

  var numExams = document.createElement('p');

  examReference.on("value", function(exams) {
    lowKey = document.createElement('h6');
    lowKey.innerHTML = "Exams";
    lowKey.id = "lowKey";
    numExams.innerHTML = exams.numChildren();
    numExams.appendChild(lowKey);
  });

  numExams.id="numExams";
  classBox.appendChild(numExams);

  wrapper.appendChild(classBox);
  document.body.appendChild(wrapper);
}

//populate main dashboard of page when page loads
function populateDashboard() {
  var ref = firebase.database().ref('Teachers');
  var counter = 0;

  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.key == userName) {
        arr.push(childSnapshot.child("Classes").val());

        for (var key in arr) {
          var x = 0;
          // skip loop if the property is from prototype
          if (!arr.hasOwnProperty(key)) continue;
          var obj = arr[key];
          for (var prop in obj) {

              // skip loop if the property is from prototype
              if(!obj.hasOwnProperty(prop)) continue;

              createClassBox(prop);
          }
        }
      }
    });
  });

}
