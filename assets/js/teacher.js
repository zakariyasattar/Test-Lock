// check if user is signed in
if(localStorage.getItem('userInfo') == null) {
  document.getElementById('body').style.display = "none";
  alert("NOT AUTHORIZED");
}

var examCodes = [];
var examCodesTeachers = [];
var arr = [];
var exams = [];

//when page loads, populateDashboard()
window.onload = function() {
  populateDashboard();
};

// retrieve userName, img from localStorage
var userName = (JSON.parse(localStorage.getItem("userInfo"))[1]);
var profileImg = (JSON.parse(localStorage.getItem("userInfo"))[2]);

//initialize aspects of page with JS data
document.getElementById('welcome-text').innerHTML = "Welcome " + userName + "!";
document.getElementById('profile').src = profileImg;

function createQuiz() {
  if(examCodes.length == 0){

    // Pull all exam codes and seperate the datapoints from each other
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

//load class based on name
function loadClass(name) {
  var examCounter = 0;
  var collectiveAvg = 0;
  var classAvg = 0;
  var classCounter = 0;

  //firebase.database().ref("Teachers/Zakariya Sattar/Classes/Algebra/Exams/mid-term").push("zaksat1:92")
  document.body.style.background = "#eeeeee";
  document.getElementById('welcome-div').style.display = "none";
  document.getElementById('wrapper').style.display = "none";
  document.getElementById('classSpecific').style.display = "initial";
  document.getElementById('main-header').innerHTML = "Welcome to " + name;

  firebase.database().ref("Teachers/" + userName + "/Classes/" + name + "/Exams/").on('value', function(snapshot) {
    exams.push(snapshot.val());
    snapshot.forEach(function(childSnapshot) {
      childSnapshot.forEach(function(exam) {
        classCounter++;
        examCounter++;
        var grade = exam.val().split(":")[1];
        collectiveAvg += parseInt(grade);

        classAvg += parseInt(grade);
      });
      createExamBox(childSnapshot.key, (classAvg / classCounter).toFixed(1));
      classAvg = 0;
      classCounter = 0;
    });
    collectiveAvg = collectiveAvg / examCounter;
    collectiveAvg = (collectiveAvg).toFixed(1)
    if(collectiveAvg == "NaN"){
      document.getElementById('avg-grade-number').innerHTML = "No Exam Data";
    }
    else{
      document.getElementById('avg-grade-number').innerHTML = collectiveAvg + "%";
    }
  });
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

function displayExamData(name) {
    document.getElementById('welcome-div').style.display = "none";
    document.getElementById('wrapper').style.display = "none";
    document.getElementById('classSpecific').style.display = "none";
    document.getElementById('exam-wrapper').style.display = "none";
    //document.getElementById('examSpecific').style.display = "initial";

    var ref = firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('className') + "/Exams/" + name);
    for (var key in exams) {
      // skip loop if the property is from prototype
      if (!arr.hasOwnProperty(key)) continue;
      var obj = exams[key];
      for (var prop in obj) {

        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;
        console.log(prop);
        if(prop == name) {
          for (var exam in obj[prop]) {
            console.log(obj[prop][exam]);
            document.body.innerHTML += obj[prop][exam];
          }
        }
      }
    }

}

function createExamBox(name, classAvg) {
  var wrapper = document.getElementById('exam-wrapper');
  wrapper.onclick = function() {
    displayExamData(name);
  };

  var classBox = document.createElement('div');
  classBox.className = "examBox";

  var span = document.createElement('span');
  span.innerHTML = name;

  classBox.appendChild(span);
  classBox.appendChild(document.createElement('hr'));

  wrapper.appendChild(classBox);
  document.body.appendChild(wrapper);
}

// create div box for every class
function createClassBox(className, numStudentsInClass, numExamsInClass) {
  var wrapper = document.getElementById('wrapper');

  var classBox = document.createElement('div');
  classBox.onclick = function() {
    localStorage.setItem('className', className);
    loadClass(className, numExamsInClass);
  };

  classBox.className = "classBox";

  var span = document.createElement('span');
  span.innerHTML = className;
  span.className = 'className';

  classBox.appendChild(span);
  classBox.appendChild(document.createElement('hr'));

  var numStudents = document.createElement('p');

  var lowKey = document.createElement('h6');
  lowKey.innerHTML = "Students";
  lowKey.id="lowKey";

  numStudents.innerHTML = numStudentsInClass;
  numStudents.appendChild(lowKey);

  numStudents.id = "numStudents";
  classBox.appendChild(numStudents);

  var hrInBetween = document.createElement('hr');
  hrInBetween.id = "hrInBetween";
  classBox.appendChild(hrInBetween);

  var numExams = document.createElement('p');

  lowKey = document.createElement('h6');
  lowKey.innerHTML = "Exams";
  lowKey.id = "lowKey";
  numExams.innerHTML = numExamsInClass;
  numExams.appendChild(lowKey);

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

              createClassBox(prop, Object.keys(obj[prop].Students).length, Object.keys(obj[prop].Exams).length);
          }
        }
      }
    });
  });

}
