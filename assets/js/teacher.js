// check if user is signed in
if(localStorage.getItem('userInfo') == null) {
  document.body.style.display = "none";
  alert("NOT AUTHORIZED");
}

var examCodes = [];
var examCodesTeachers = [];
var arr = [];
var exams = [];
var examData = [];
var totalPoints;
var autoSaveCounter = 0;
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// HAS LOADED
var examDataHasLoaded = false;
var userDataHasLoaded = false;


//when page loads, populateDashboard()
window.onload = function() {
  populateDashboard();

  $('.dropdown').click(function(){
    $('.dropdown-menu').toggleClass('show');
  });

  $("#description").focus(function() {
    $("#description").css("border", "1px solid #458ec1");
  }).blur(function() {
    $("#description").css("border", "1px solid lightgray");
  });

  $("#create-exam").on('blur', ":input", function() {
    saveExam(false);
  });

  $("#create-exam").on('change', "input:radio", function() {
    saveExam(false);
  });

  // for create-exam
  $(window).scroll(function(){
    for(var i = 1; i < document.getElementsByClassName('question').length + 1; i++) {
      var elem = document.getElementById(i);
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();

      var elemTop = $(elem).offset().top;
      var elemBottom = elemTop + $(elem).height();

      var isInView = ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));

      if (isInView){
        document.getElementById('question-manager').scrollTop = document.getElementById('question-tracker').clientHeight * (i - 1);
        document.getElementsByClassName(i)[0].childNodes[0].innerHTML = "&#x25CF;"
        document.getElementsByClassName(i)[0].childNodes[1].childNodes[0].style.color = "white";
      }
      else {
        document.getElementsByClassName(i)[0].childNodes[0].innerHTML = "&#x25CC;";
        document.getElementsByClassName(i)[0].childNodes[1].childNodes[0].style.color = "black";
      }
    }
  })
};

// retrieve userName, img from LocalStorage
var userName = (JSON.parse(localStorage.getItem("userInfo"))[1]);
var profileImg = (JSON.parse(localStorage.getItem("userInfo"))[2]);

//initialize aspects of page with JS data
document.getElementById('welcome-text').innerHTML = "Welcome " + userName + "!";
document.getElementById('profile').src = profileImg;

$('#profile').click(function(){
  swal({
    title: "Sign Out",
    text: "Are You Sure You Want To Sign Out?",
    icon: "warning",
    buttons: ["Cancel", "Sign Me Out!"],
  })
  .then((value) => {
    if(value) {
      window.location.href = "index.html?noRedirect";
    }
  });
});

// create initial framework for exams
function createQuiz() {
  var examCounter = 0;

  if(examCodes.length == 0){
    // Pull all exam codes and seperate the datapoints from each other
    firebase.database().ref('exam-codes').on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        examCodes.push(childSnapshot.val().split(";")[0]);
        examCodesTeachers.push(childSnapshot.val().split(";")[1])
      });
    });
  }

  var randomCode = generateCode();

  var examInit = {
    examCode: randomCode.toUpperCase(),
    examTitle: "",
    lastSaved: "",
    examType: "",
    examTotalPoints: "",
    examTotalMins: "",
    examDate: "",
    examDescription: "",
    questions: [
      {
        title: '',
        type:   '',
        points: '',
        choices: [
          {value: ""},
          {value: ""},
          {value: ""},
          {value: ""},
        ]
      }
    ]
  };


  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('className') + "/Exams/").once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val() == "no_exams") {
        firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('className') + "/Exams/").child(childSnapshot.key).remove();
      }
      else {
        examCounter++;
      }
    });
  });

  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('className') + "/Exams/" + alphabet[examCounter] + randomCode.toUpperCase()).push(examInit);

  createQuestion(true, 4);

  document.getElementById('create-exam').style.display = "initial";
  document.getElementById('main').style.display = "none";
  document.body.style.background = "white";
  document.getElementById('exam-code').innerHTML = randomCode.toUpperCase();
}

// Alert After Save
function successfulSave() {
  var alert = document.createElement('div');
  alert.innerHTML = "Successfully Saved Exam!"
  alert.style.textAlign = "center";
  alert.style.width = "100%";
  alert.style.position = "fixed";
  alert.style.zIndex = "100000";
  alert.style.top = "0";
  alert.className = "alert alert-success";
  alert.role = "alert";

  document.getElementById('create-exam').appendChild(document.createElement('center').appendChild(alert));

  setTimeout(function(){ document.getElementsByClassName('alert')[0].remove(); }, 2500);
}

// Save Exam
function saveExam(alert) {
  if(alert) {
    successfulSave();
  }

  var newSave = new Date().toLocaleString().replace(",", " @");
  if(newSave == "") {
    newSave = " Not Saved!";
  }

  document.getElementById('last-saved').innerHTML = "Last Sync: " + newSave;
  document.getElementsByClassName('points')[0].value = getAllPoints();

  if(document.getElementById('nameOfExam').value != "") {
    firebase.database().ref("exam-codes").once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.val().split(";")[0] == document.getElementById('exam-code').innerHTML) {
          firebase.database().ref("exam-codes").child(childSnapshot.key).set(childSnapshot.val().split(";")[0] + ";" + childSnapshot.val().split(";")[1] + ";" + childSnapshot.val().split(";")[2] + ";" + document.getElementById('nameOfExam').value);
        }
      });
    });
  }

  var examInit = {
    examTeacher: userName,
    examCode: document.getElementById('exam-code').innerHTML,
    examTitle: document.getElementById('nameOfExam').value,
    lastSaved: newSave,
    examTotalPoints: getAllPoints(),
    examTotalMins: document.getElementsByClassName('time')[0].value,
    examDate: document.getElementById('date').value,
    examDescription: document.getElementById('description').value,
    questions: []
  };

  var localQuestions = document.getElementsByClassName('question');
  var pluginArrayArg = new Array();

  for(var i = 0; i < localQuestions.length; i++) {
    var question = localQuestions[i];
    var children = question.childNodes;

    var jsonArg1 = new Object();
    jsonArg1.title = children[4].value;
    jsonArg1.type = children[5].value;
    jsonArg1.points = children[6].childNodes[1].value;
    jsonArg1.checked = -1;
    jsonArg1.choices = [];

    if(jsonArg1.type == 'mc') {
      for(var j = 0; j < children[7].childNodes.length - 1; j++){
        jsonArg1.choices.push(children[7].childNodes[j].childNodes[2].value);

        if(children[7].childNodes[j].childNodes[1].checked == true) {
          jsonArg1.checked = j;
        }
      }
    }

    else if(jsonArg1.type == 'fr') {
      jsonArg1.choices.push(children[8].value);
    }

    else if(jsonArg1.type == 'tf') {
      if(children[8].childNodes[0].checked) {
        jsonArg1.choices.push("true");
      }
      else {
        jsonArg1.choices.push("false");
      }
    }

    else {
      var boxes = document.getElementsByClassName('matchingbox');
      jsonArg1.numBoxes = boxes.length;

      for(var i = 0; i < boxes.length; i++) {
        var question = boxes[i].childNodes[3].value;
        var result = boxes[i].childNodes[5].value;

        jsonArg1.choices.push(question + ";" + result);
      }
    }

    pluginArrayArg.push(jsonArg1);
    var questions = JSON.parse(JSON.stringify(pluginArrayArg))
    $.extend(examInit, { questions });
  }

  var code = "";

  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/").once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.key.substring(1) == document.getElementById('exam-code').innerHTML) {
        code = childSnapshot.key;
      }
    });
    firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/" + code).once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.key != "responses" && childSnapshot.key != "taken") {
          firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/" + code).child(childSnapshot.key).set(examInit);
        }
      });
    });
  });
}

function getAllPoints() {
  var pointsBoxes = document.getElementsByClassName('numPoints');
  var points = 0;

  for(var i = 0; i < pointsBoxes.length; i++) {
    if(pointsBoxes[i].value != "") {
      points += parseInt(pointsBoxes[i].value);
    }
  }

  return points;
}

function createQuestionTracker(i, populating) {
  var manager = document.getElementById('question-manager');
  var tracker = document.createElement('div');
  tracker.id = "question-tracker";
  tracker.className = i;

  $(tracker).hover(function(){
    this.style.cursor = "pointer";
    $(this).children()[0].innerHTML = "&#x25CF;";
    this.childNodes[1].childNodes[0].style.color = "white";
  }, function(){
    this.childNodes[1].childNodes[0].style.color = "black";
    $(this).children()[0].innerHTML = "&#x25CC;";
  });

  tracker.onclick = function() {
    document.getElementById(i).scrollIntoView({block: "center"});
  }

  var circle = document.createElement('div');
  circle.id = "circle";
  circle.innerHTML = "&#x25CC;"

  var center = document.createElement('center');
  var text = document.createElement('div');
  text.id = "text";
  text.innerHTML = i;

  center.appendChild(text);

  tracker.appendChild(circle);
  tracker.appendChild(center);

  manager.appendChild(tracker);
  manager.scrollTop = (manager.clientHeight + manager.clientHeight);
}

//populate exam for autosave
function populateExam(code, ref) {
  var refs = ref.split('/'); refs.pop();

  firebase.database().ref(refs.join().split(',').join('/')).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.key.substring(1) == code) {
        firebase.database().ref(refs.join().split(',').join('/') + "/" + childSnapshot.key).once('value').then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var val = childSnapshot.val();

            if(val.examCode != undefined){
              var counter = 0;

              document.getElementById('last-saved').innerHTML = "Last Sync: " + val.lastSaved;
              document.getElementById('exam-code').innerHTML = val.examCode;
              document.getElementById('date').value = val.examDate;
              document.getElementById('description').value = val.examDescription;
              document.getElementById('nameOfExam').value = val.examTitle;
              document.getElementsByClassName('time')[0].value = val.examTotalMins;

              for(var i = 0; i < Object.keys(val.questions).length; i++) {
                var localQuestions = document.getElementsByClassName('question');
                var question = childSnapshot.val().questions[i];

                if(question.choices != undefined && question.type != "matching") {
                  createQuestion(true, Object.keys(question.choices).length);
                  createQuestionTracker(i + 1, true);

                  localQuestions[i].childNodes[4].value = question.title;
                  localQuestions[i].childNodes[6].childNodes[1].value = question.points;
                  localQuestions[i].childNodes[5].value = question.type;

                  changeQuestionType(question.type, i, 'mc');

                  if(question.type == "mc") {
                    for(var j = 0; j < Object.keys(question.choices).length; j++){
                      if(question.choices[j].value != undefined){
                        localQuestions[i].childNodes[7].childNodes[j].childNodes[2].value = (question.choices[j].value);
                        if(j == question.checked) {
                          setChecked(localQuestions[i].childNodes[7].childNodes[j].childNodes[1]);
                        }
                      }
                      else {
                        localQuestions[i].childNodes[7].childNodes[j].childNodes[2].value = (question.choices[j]);
                        if(j == question.checked) {
                          setChecked(localQuestions[i].childNodes[7].childNodes[j].childNodes[1]);
                        }
                      }
                    }
                  }

                  else if(question.type == "fr"){
                    localQuestions[i].childNodes[8].value = (question.choices[0]);
                  }

                  else if(question.type == "tf") {
                    if(question.choices[0] == 'true') {
                      localQuestions[i].childNodes[8].childNodes[0].checked = true;
                    }
                    else {
                      localQuestions[i].childNodes[8].childNodes[2].checked = true;
                    }
                  }
                }

                // else if(question.type == "matching") {
                //   createQuestion(true, question.numBoxes);
                //   createQuestionTracker(i + 1, true);
                //   changeQuestionType(question.type, i, "mc");
                //
                //   localQuestions[i].childNodes[3].value = question.title;
                //   localQuestions[i].childNodes[5].childNodes[1].value = question.points;
                //   localQuestions[i].childNodes[4].value = question.type;
                //
                //   localQuestions[i].childNodes[0].value = question.numBoxes;
                //   for(var j = 0; j < question.numBoxes; j++) {
                //     createMatchingElement(localQuestions[i].childNodes[6], j + 1);
                //   }
                //
                //   var localBoxes = document.getElementsByClassName('matchingbox');
                //   for(var k = 0; k < localBoxes.length; k++) {
                //     localBoxes[k].childNodes[0].value = question.choices[k].split(";")[0];
                //     localBoxes[k].childNodes[2].value = question.choices[k].split(";")[1];
                //   }
                // }
              }
            }
          });
        });
      }
    });
  });

  setTimeout(function(){ document.getElementsByClassName('points')[0].value = getAllPoints(); }, 200);
}

function setChecked(div) {
  setTimeout(function(){ div.checked = true; }, 200);
}

//load class based on name
function loadClass(name) {
    if($("#exam-wrapper") != undefined) {
      $("#exam-wrapper").empty();
    }
    var examCounter = 0;
    var collectiveAvg = 0;
    var classAvg = 0;
    var classCounter = 0;
    var counter = -1

    document.getElementById('welcome-div').style.display = "none";
    document.getElementById('wrapper').style.display = "none";
    document.getElementById('classSpecific').style.display = "initial";
    document.getElementById('exam-wrapper').style.display = "grid";
    document.getElementById('main-header').innerHTML = "Welcome to " + name;
    document.body.style.backgroundImage = "linear-gradient(to top, #dfe9f3 0%, white 100%)";

    localStorage.setItem('createExamClass', name);

    firebase.database().ref("Teachers/" + userName + "/Classes/" + name + "/Exams/").on('value', function(snapshot) {
      exams.push(snapshot.val());
      counter++;
      snapshot.forEach(function(childSnapshot) {
        childSnapshot.child('responses').forEach(function(exam) {
          classCounter++;
          examCounter++;
          var grade = exam.val()[Object.keys(exam.val())[0]].score;
          collectiveAvg += parseInt(grade);

          classAvg += parseInt(grade);
        });

        for(var key in childSnapshot.val()) {
          if(childSnapshot.val() != "no_exams") {
            createExamBox(childSnapshot.val()[key].examTitle, (classAvg / classCounter).toFixed(1), "Teachers/" + userName + "/Classes/" + name + "/Exams/" + childSnapshot.key, childSnapshot.val()[key].examCode);
            var val = childSnapshot.val()[key].examTitle;

            if(localStorage.getItem("CreatedExamCode") != "") {
              var button = document.getElementById('cached-code');
              if(button != null) {
                button.id = "cached-exam-button";
                button.style.display = "inline-block";

                button.onclick = function() {
                  document.getElementById('create-exam').style.display = "initial";
                  document.getElementById('main').style.display = "none";
                  document.body.style.background = "white";

                  populateExam(localStorage.getItem("CreatedExamCode").toUpperCase(), "Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/" + localStorage.getItem("CreatedExamCode").toUpperCase());
                }
              }
            }

            if(childSnapshot.val()[key].examTitle == ""){
              val = childSnapshot.val()[key].examCode;
            }

            if(localStorage.getItem("CreatedExamCode") != null && localStorage.getItem("CreatedExamCode").toUpperCase() == childSnapshot.val()[key].examCode) {
              setTimeout(function(){
                document.getElementById('cached-exam-button').style.display = "initial";
                document.getElementById('cached-exam-code').innerHTML = "Edit " + val;
              }, 2);
            }
            else if(document.getElementById('cached-exam-button') != null){
              document.getElementById('cached-exam-button').style.display = "none";
            }
            break;
          }
          else {
            document.getElementById('no-exams').style.display = "initial";
          }
        }
        classAvg = 0;
        classCounter = 0;
      });

      collectiveAvg = collectiveAvg / examCounter;
      collectiveAvg = (collectiveAvg).toFixed(1);

      if(collectiveAvg == "NaN"){
        document.getElementById('avg-grade-number').innerHTML = "No Data";
      }
      else{
        document.getElementById('avg-grade-number').innerHTML = collectiveAvg + "%";
      }
    });
}

// Generate random exam code
function generateCode() {
  var code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  var className = "";

  var string = document.getElementById('main-header').innerHTML.substring(document.getElementById('main-header')).split(" ");
  string.shift(); string.shift();

  for(var i = 0; i < string.length; i++) {
    if(i != string.length - 1) {
      className += string[i] + " ";
    }
    else{
      className += string[i];
    }
  }

  if(examCodes.indexOf(code) == -1){
    firebase.database().ref("exam-codes").push(code.toUpperCase() + ";" + userName + ";" + className + ";" + code.toUpperCase());
    localStorage.setItem("CreatedExamCode", code);
    return code;
  }
  else {
    generateCode(); // Rerun generateCode() if code exists already
  }
}

// remove dropdown if screen size can handle navbar
function removeDropDown(x) {
 if (x.matches) { // If media query matches
   document.getElementById('dropdown').style.display = "none"; // Remove DropDown
 } else {
   document.getElementById('dropdown').style.display = "initial"; //Bring DropDown back
 }
}

// JS media query for dropdown nav
var x = window.matchMedia("(min-width: 601px)") // Specify what to set media-queries at
removeDropDown(x) // Call listener function at run time
x.addListener(removeDropDown) // Attach listener function on state changes

// function to display all data in the table by className
function displayExamData(name) {
  if(!examDataHasLoaded) {
    var cumAvg = 0;
    var classLength = 0;
    var highest = "a:-1000";
    var lowest = "a:1000";
    var quickest = "a:1000";
    var slowest = "a:-1000";
    var table;
    var populated = false;
    var standardDeviation = [];

    document.getElementById('welcome-div').style.display = "none";
    document.getElementById('wrapper').style.display = "none";
    document.getElementById('classSpecific').style.display = "none";
    document.getElementById('exam-wrapper').style.display = "none";
    document.getElementById('examSpecific').style.display = "initial";
    document.getElementById('sort-menu').style.display = "initial";
    document.getElementById('exam-name').innerHTML = name;
    document.body.style.backgroundImage = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";

    var i = document.createElement('i');
    i.className = "glyphicon glyphicon-circle-arrow-up";
    i.id = "topPage";

    i.onclick = function() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    document.getElementById('main').appendChild(document.createElement('br'));
    document.getElementById('main').appendChild(i);

    for (var key in exams) {
      // skip loop if the property is from prototype
      if (!arr.hasOwnProperty(key)) continue;
      var obj = exams[key];

      for (var prop in obj) {
        for(var initData in obj[prop]){
          if(obj[prop][initData].examCode != undefined && Object.keys(obj[prop]).length > 1) {
            var code = obj[prop][initData].examCode;

            document.getElementById('edit-exam').innerHTML = name;
            document.getElementById('edit-current-exam').style.display = "initial";

            document.getElementById('edit-current-exam').onclick = function() {
              document.getElementById('create-exam').style.display = "initial";
              document.getElementById('main').style.display = "none";
              document.body.style.background = "white";
              populateExam(code, "Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/" + prop)
            };

            // skip loop if the property is from prototype
            if(!obj.hasOwnProperty(prop)) continue;

            var dbName = obj[prop][initData].examTitle;
            if(dbName == "") {
              dbName = obj[prop][initData].examCode;
            }

            if(dbName == name) {
              var random = document.createElement('div');
              var table = document.createElement('table');

              table.id = "random";
              table.className = "table table-striped";
              table.style.width = "100vw";

              var init = document.createElement('tr');
              init.style.color = "darkgray";

              var initName = document.createElement('td');
              initName.innerHTML = "Name";
              initName.style.paddingLeft = "66px";
              initName.id = "name";

              var initScore = document.createElement('td');
              initScore.innerHTML = "Score (%)"
              initScore.id = "score";

              var initPercentile = document.createElement('td');
              initPercentile.innerHTML = "Percentile";
              initPercentile.id = "percentile";

              var initTime = document.createElement('td');
              initTime.innerHTML = "Time";
              initTime.id = "time";

              init.appendChild(initName);
              init.appendChild(initScore);
              init.appendChild(initPercentile);
              init.appendChild(initTime);

              table.appendChild(init);
            }
          }
          else if(Object.keys(obj[prop]).length > 1 && !populated){
            populated = true;
            for(var response in obj[prop].responses){
              var data = obj[prop].responses[response][Object.keys(obj[prop].responses[response])[0]];

              standardDeviation.push(parseInt(data.score));
              examData.push(data.name + ":" + data.score + ":" + data.time);
              cumAvg += parseInt(data.score);
              classLength = Object.keys(obj[prop].responses).length;

              if(parseInt(data.score) > parseInt(highest.split(":")[1])) {
                highest = data.name + ":" + parseInt(data.score);
              }

              if(parseInt(data.score) < parseInt(lowest.split(":")[1])) {
                lowest = data.name + ":" + parseInt(data.score);
              }

              var tr = document.createElement('tr');
              tr.className = response;
              var examCode = prop;
              tr.onclick = function() { loadStudentExamData(this.className, examCode); }

              table.appendChild(document.createElement('br'));

        			var name = document.createElement('td');
              name.style.paddingLeft = "66px";
              name.id = "name";
        			var score = document.createElement('td');
        			var percentile = document.createElement('td');
              var time = document.createElement('td');

        			name.innerHTML = data.name;
              name.id = "name";

        			score.innerHTML = data.score + "%";
              score.id = "score";

              time.innerHTML = data.time + " Mins";
              time.id = "time";

        			percentile.innerHTML = getPercentileOriginal(parseInt(data.score), obj[prop].responses, data.name) + "th";
              percentile.id = "percentile";

        			tr.appendChild(name);
        			tr.appendChild(score);
        			tr.appendChild(percentile);
              tr.appendChild(time);
        			table.appendChild(tr);

              random.appendChild(table);
              document.getElementById('main').appendChild(random);
            }
          }
        }
      }
    }

      var overallData = document.getElementById('overall-data');
      var ul = document.createElement('ul');
      ul.style.float = "right";
      ul.style.marginRight = "15vw";

      var avg = document.createElement('li');
      avg.innerHTML = "Class Average: " + (cumAvg / classLength).toFixed(1) + '%';
      avg.style.fontSize = "20px";

      var highestScorer = document.createElement('li');
      highestScorer.innerHTML = "Highest Scorer: " + highest.split(":")[0] + " (" + highest.split(":")[1] + "%)";
      highestScorer.style.fontSize = "20px";

      var lowestScorer = document.createElement('li');
      lowestScorer.innerHTML = "Lowest Scorer: " + lowest.split(":")[0] + " (" + lowest.split(":")[1] + "%)";
      lowestScorer.style.fontSize = "20px";

      var standardDev = document.createElement('li');

      // calc SD
      mean = standardDeviation.reduce((a,b) => a+b)/standardDeviation.length;
      sd = Math.sqrt(standardDeviation.map(x => Math.pow(x-mean,2)).reduce((a,b) => a+b)/standardDeviation.length);

      standardDev.innerHTML = "Standard Deviation (σ): " + sd.toFixed(3);
      standardDev.style.fontSize = "20px";

      ul.appendChild(avg);
      ul.appendChild(highestScorer);
      overallData.appendChild(document.createElement('br'));
      ul.appendChild(lowestScorer);
      ul.appendChild(standardDev);

      overallData.appendChild(ul);
    }
    else {
      var possibleTables = document.getElementsByClassName('table');
      possibleTables[0].style.display = "table";

      document.getElementById('topPage').style.display = "initial";
      document.getElementById('examSpecific').style.display = "inherit";
      document.getElementById('classSpecific').style.display = "none";
      document.getElementById('exam-wrapper').style.display = "none";

      document.body.style.backgroundImage = "linear-gradient(135deg, rgb(245, 247, 250) 0%, rgb(195, 207, 226) 100%);";
    }
    examDataHasLoaded = true;
}

function getPercentileOriginal(score, exam, name) {
  var numBelow = 0;
  var numEqual = 0;

  for(var student in exam) {
    if(score > parseInt(exam[student][Object.keys(exam[student])[0]].score)) {
      numBelow++;
    }
    else if(score == parseInt(exam[student][Object.keys(exam[student])[0]].score) && name != exam[student][Object.keys(exam[student])[0]].name) {
      numEqual++;
    }
  }
  return 100 * (numBelow / (Object.keys(exam).length)).toFixed(1);
}

//function to remove all class='active'
function removeAllActive() {
  var navBars = document.getElementsByTagName("LI");

  for(var i = 0; i < navBars.length; i++) {
    navBars[i].className = "";
  }
}

//function to switch displays based on what user clicks
function display(title) {
  if(title == '<a href="#">Ping-Pong</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "initial";
    document.getElementById('leaderboard').style.display = "none";
    document.getElementById('feedback').style.display = "none";
    document.getElementById('create-exam').style.display = "none"
  }
  else if(title == '<a href="#">Dashboard</a>') {
    document.getElementById('main').style.display = "initial";
    document.getElementById('pong').style.display = "none";
    document.getElementById('leaderboard').style.display = "none";
    document.getElementById('feedback').style.display = "none";
    document.getElementById('create-exam').style.display = "none"
  }
  else if(title == '<a href="#">Leaderboard</a>') {
    populateLeaderboard(); // takes care of all other display calls
    document.getElementById('feedback').style.display = "none";
    document.getElementById('create-exam').style.display = "none"
  }
  else if(title == '<a href="#">Feedback</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "none";
    document.getElementById('leaderboard').style.display = "none";
    document.getElementById('feedback').style.display = "initial";
    document.getElementById('create-exam').style.display = "none"

    var iframe = $("#feedback-form");
    iframe.attr("src", 'https://forms.id/f/zakariyasattar.id.blockstack/56856430b7');
  }
}

// function to display / undisplay items to simulate going home
function goHomeFromExams() {
  document.getElementById('classSpecific').style.display = "none";
  document.getElementById('welcome-div').style.display = "block";
  document.getElementById('wrapper').style.display = "grid";
  document.getElementById('doesNotExist').style.display = "none";
  document.getElementById('no-exams').style.display = "none";
  document.getElementById('exam-wrapper').style.display = "none";

  document.body.style.backgroundImage = "none"
}

function goExamsFromExam() {
  var possibleTables = document.getElementsByClassName('table');

  for(var i = 0; i < possibleTables.length; i++) {
    possibleTables[i].style.display = "none";
  }

  document.getElementById('topPage').style.display = "none";
  document.getElementById('examSpecific').style.display = "none";
  document.getElementById('classSpecific').style.display = "initial";
  document.getElementById('exam-wrapper').style.display = "grid";

  document.body.style.backgroundImage = "linear-gradient(to top, rgb(223, 233, 243) 0%, white 100%)";
  $(document.getElementById('overall-data')).empty()
}

function goHomeFromExamData() {
  goExamsFromExam(); goHomeFromExams();
}

// function to display student exam data
function loadStudentExamData(name, code) {
  document.getElementById('examSpecific').style.display = "none";
  document.getElementById('student-exam-data').style.display = "initial";
  document.body.style.backgroundImage = "none";
  var answer = "";

  //linear-gradient(135deg, rgb(245, 247, 250) 0%, rgb(195, 207, 226) 100%);

  var table = document.getElementsByClassName('table');
  for(var i = 0; i < table.length; i++) {
    table[i].style.display = "none";
  }

  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem("className") + "/Exams/" + code).once('value', function(snapshot) {
    var data = (snapshot.val().responses[name][Object.keys(snapshot.val().responses[name])[0]]);

    var studentPoints = data.totalScore / 100 * snapshot.val()[Object.keys(snapshot.val())[0]].examTotalPoints;
    document.getElementById('score-num').innerHTML = (studentPoints).toFixed(0) + " / " + snapshot.val()[Object.keys(snapshot.val())[0]].examTotalPoints;
    document.getElementById('score').innerHTML = data.totalScore + "%";

    var corrAnswer = "";
    localStorage.setItem("totalPointsExcludingFr", 0);

    for(var i = 0; i < Object.keys(data.answers).length; i++) {

      if(snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].type == "tf") {
        corrAnswer = snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].choices[0];
      }
      else if(snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].type == "mc"){
        corrAnswer = snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].checked;
      }
      else if(snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].type == "fr") {
        corrAnswer = "";
      }
      createGradedQuestion(
        // PARAM: studAnswer
        data.answers[i].split(";")[1],
        // PARAM: corrAnswer
        corrAnswer,
        // PARAM: numAnswerChoices
        Object.keys(snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].choices).length,
        // PARAM: numPoints
        snapshot.val()[Object.keys(snapshot.val())[0]].questions[i].points,
        // PARAM: questions
        snapshot.val()[Object.keys(snapshot.val())[0]].questions[i],
        // PARAM: studName
        name,
        // PARAM: examCurrentCode
        code,
        // PARAM: examTotalPoints
        snapshot.val()[Object.keys(snapshot.val())[0]].examTotalPoints
      );
    }
  });
}

//create Question box for every graded question
function createGradedQuestion(studAnswer, corrAnswer, numAnswerChoices, numAnswerPoints, questions, studName, examCurrentCode, examTotalPoints) {
  var awardedPoints = 0;
  if(corrAnswer == "true"){
    corrAnswer = "0";
    numAnswerChoices = 2;
  }
  else if(corrAnswer == 'false') {
    corrAnswer = "1";
    numAnswerChoices = 2;
  }

  var correct = false;
  if(studAnswer == corrAnswer) {
    correct = true;
  }

  if(questions.type != "fr" && correct) {
    localStorage.setItem("totalPointsExcludingFr", parseInt(localStorage.getItem("totalPointsExcludingFr")) + parseInt(questions.points))
  }

  var exam = document.getElementById('question-data');

  var question = document.createElement('div');
  question.className = "question";
  question.id = document.getElementsByClassName('question').length + 1;

  var num = document.createElement('span');
  num.innerHTML = document.getElementsByClassName('question').length + 1 + ". ";
  num.style.color = "#97a5aa";

  var hr = document.createElement('hr');

  var question_title = document.createElement('input');
  question_title.readOnly = true;
  question_title.value = questions.title;
  question_title.id = "question-title";

  question.appendChild(num);
  question.appendChild(question_title);

  if(correct) {
    awardedPoints = numAnswerPoints;
  }

  var points = document.createElement('div');
  points.id = "points";

  var span = document.createElement('span');
  span.innerHTML = "( ";

  var numPoints = document.createElement('span');
  numPoints.type = "text";
  numPoints.id = "numPoints";
  numPoints.innerHTML = numAnswerPoints;

  var finishingSpan = document.createElement('span');
  finishingSpan.className = "pa";
  finishingSpan.innerHTML = " points)  -  points awarded: " + awardedPoints;

  points.appendChild(span); points.appendChild(numPoints); points.appendChild(finishingSpan);

  question.appendChild(points);

  var answer_choices = document.createElement('div');
  answer_choices.className = "mc";

  for(var i = 0; i < numAnswerChoices; i++) {
    var label = document.createElement('label');
    label.id = "label";
    label.style.width = "95%"
    if((correct && i == studAnswer) || i == corrAnswer) {
      label.style.background = "#e4f7e4";
      label.style.borderTop = "1px solid #00cc00"
      label.style.borderBottom = "1px solid #00cc00"

      var correctAnswer = document.createElement('span');
      correctAnswer.innerHTML = "Correct Answer"
      correctAnswer.style.float = "right";
      correctAnswer.style.fontWeight = "normal";
      correctAnswer.style.marginTop  = "10px";
      correctAnswer.style.color = "#00cc00";
      correctAnswer.style.marginRight  = "15px";

      label.appendChild(correctAnswer);
    }
    else if(!correct && i == studAnswer) {
      label.style.background = "#f2ebeb";
      label.style.borderTop = "1px solid #cc5252"
      label.style.borderBottom = "1px solid #cc5252"
      label.style.color = "#cc5252";

      var incorrectAnswer = document.createElement('span');
      incorrectAnswer.innerHTML = "Student Answer"
      incorrectAnswer.style.float = "right";
      incorrectAnswer.style.fontWeight = "normal";
      incorrectAnswer.style.marginTop  = "10px";
      incorrectAnswer.style.color = "#cc5252";
      incorrectAnswer.style.marginRight  = "15px";
      label.appendChild(incorrectAnswer);
    }

    var input = document.createElement('input');
    input.disabled = true;
    input.style.outline = "none";
    input.type = "radio";
    input.className = "option-input radio";
    input.name = num.innerHTML;

    var span = document.createElement('span');
    if(questions.type != "tf" && questions.type != "fr") {
      span.innerHTML = questions.choices[i];
    }
    else if(questions.type == "tf"){
      if(i == 0) {
        span.innerHTML = "True";
      }
      else {
        span.innerHTML = "False";
      }
    }
    span.style.fontWeight = "normal"

    var answer_choice = document.createElement('span');
    answer_choice.className = "option";
    answer_choice.id = "question-choice";

    label.appendChild(input);
    label.appendChild(answer_choice);
    label.appendChild(span);
    answer_choices.appendChild(label);
  }

  if(questions.type == "fr") {
    var ta = document.createElement('textarea');
    $(ta).attr("readonly", true);
    ta.className = "fr";
    ta.value = studAnswer;

    var pointsAwardedSpan = document.createElement('span');
    pointsAwardedSpan.innerHTML = "Points Awarded - ";

    var numAcceptedPoints = document.createElement('input');
    numAcceptedPoints.maxLength = questions.points.length;

    firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem("className") + "/Exams/" + examCurrentCode + "/responses/" + studName).once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var questionNum;
        var answers = childSnapshot.val().answers;

        if(answers[2].split(";")[2] != undefined) {
          setTimeout(function(){ document.getElementsByClassName('pa')[parseInt(num.innerHTML.substring(0, num.innerHTML.indexOf("."))) - 1].innerHTML = " points)  -  points awarded: " + answers[2].split(";")[2]; }, 100);
          numAcceptedPoints.value = answers[2].split(";")[2];
        }
      });
    });

    numAcceptedPoints.onkeyup = function () {
      this.value = this.value.replace(/[^\d]/,'');
      this.value = this.value.replace('-', '');

      if(this.value != "") {
        document.getElementsByClassName('pa')[parseInt(num.innerHTML.substring(0, num.innerHTML.indexOf("."))) - 1].innerHTML = " points)  -  points awarded: " + this.value;
      }
      else {
        document.getElementsByClassName('pa')[parseInt(num.innerHTML.substring(0, num.innerHTML.indexOf("."))) - 1].innerHTML = " points)  -  points awarded: 0";
      }

      var cleanVersion = this.value;

      firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem("className") + "/Exams/" + examCurrentCode + "/responses/" + studName).once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var questionNum;
          var answers = childSnapshot.val().answers;

          for(var k = 0; k < answers.length; k++) {
            if(isNaN(parseInt(answers[k].split(";")[1]))) {
              answers[k] = answers[k].split(";")[0] + ";" + answers[k].split(";")[1] + ";" + cleanVersion;
            }
          }
          firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem("className") + "/Exams/" + examCurrentCode + "/responses/" + studName + "/" + childSnapshot.key).update({ 'answers': answers });

          var newScore = (((parseInt(localStorage.getItem("totalPointsExcludingFr")) + parseInt(cleanVersion)) / examTotalPoints) * 100).toFixed(1);
          firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem("className") + "/Exams/" + examCurrentCode + "/responses/" + studName + "/" + childSnapshot.key).update({ 'totalScore': newScore });

          document.getElementById("score").innerHTML = newScore + "%";
          document.getElementById("score-num").innerHTML = (parseInt(localStorage.getItem("totalPointsExcludingFr")) + parseInt(cleanVersion)) + " / " + examTotalPoints;
        });
      });
    }

    numAcceptedPoints.placeholder = "0 - " + questions.points;
    numAcceptedPoints.style.padding = "5px";
    numAcceptedPoints.style.fontSize = "15px";
    numAcceptedPoints.style.border = "1px solid #808080";
    numAcceptedPoints.style.borderRadius = "3px";
    numAcceptedPoints.style.marginTop = "20px";

    question.appendChild(ta);
    question.appendChild(document.createElement('br'));
    question.appendChild(pointsAwardedSpan);
    question.appendChild(numAcceptedPoints);
  }
  else {
    question.appendChild(answer_choices);
  }

  exam.appendChild(question);
  exam.appendChild(document.createElement('br'));
  exam.appendChild(hr);

}

//function to calc precentile range
function getPercentile(val, exam) {
  var numBelow = 0;
  var numEqual = 0;

  for(var student in exam) {
    if(parseInt(val.split(":")[1]) > parseInt(exam[student].split(":")[1])) {
      numBelow++;
    }
    else if(parseInt(val.split(":")[1]) == parseInt(exam[student].split(":")[1]) && val.split(":")[0] != exam[student].split(":")[0]) {
      numEqual++;
    }
  }
  return 100 * (numBelow / (Object.keys(exam).length)).toFixed(1);
}

// sort function
function sort(func) {
  var tables = document.getElementsByClassName('table table-striped');

  for(var t = 0; t < tables.length; t++) {
    tables[t].style.display = "none";
  }

  var testExamData = examData.slice();
  testExamData.sort();

  if(func == " Original") {
    var table = document.createElement('table');
    table.id = "random";
    table.className = "table table-striped";
    table.style.width = "100vw";

    var init = document.createElement('tr');
    init.style.color = "darkgray";

    var initName = document.createElement('td');
    initName.innerHTML = "Name";
    initName.style.paddingLeft = "66px";
    initName.id = "name";

    var initScore = document.createElement('td');
    initScore.innerHTML = "Score (%)"
    initScore.id = "score";

    var initPercentile = document.createElement('td');
    initPercentile.innerHTML = "Percentile";
    initPercentile.id = "percentile";

    var initTime = document.createElement('td');
    initTime.innerHTML = "Time";
    initTime.id = "time";

    init.appendChild(initName);
    init.appendChild(initScore);
    init.appendChild(initPercentile);
    init.appendChild(initTime);

    table.appendChild(init);

    for(var i = 0; i < examData.length; i++){
      var tr = document.createElement('tr');

      var iTracker = i;
      console.log(examData[iTracker]);
      tr.onclick = function() { loadStudentExamData(examData[iTracker].split(":")[0]); }

      table.appendChild(document.createElement('br'));

      var name = document.createElement('td');
      name.style.paddingLeft = "66px";
      var score = document.createElement('td');
      var percentile = document.createElement('td');

      name.innerHTML = examData[i].split(":")[0];
      score.innerHTML = examData[i].split(":")[1] + "%";
      percentile.innerHTML = getPercentile(examData[i], examData) + "th";

      var time = document.createElement('td');
      time.innerHTML = examData[i].split(":")[2] + " Mins";
      time.id = "time";

      tr.appendChild(name);
      tr.appendChild(score);
      tr.appendChild(percentile);
      tr.appendChild(time);
      table.appendChild(tr);
    }

    document.getElementById('main').appendChild(table);
  }
  else {
    if(func == " Sort By Alphabet (A-Z)"){
      testExamData.sort();

      var table = document.createElement('table');
      table.id = "random";
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";
      initName.id = "name";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"
      initScore.id = "score";

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";
      initPercentile.id = "percentile";

      var initTime = document.createElement('td');
      initTime.innerHTML = "Time";
      initTime.id = "time";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);
      init.appendChild(initTime);

      table.appendChild(init);

      for(var i = 0; i < testExamData.length; i++){
        var tr = document.createElement('tr');
        tr.onclick = function() { loadStudentExamData(testExamData[i].split(":")[0]); }

        table.appendChild(document.createElement('br'));

        var name = document.createElement('td');
        name.style.paddingLeft = "66px";
        var score = document.createElement('td');
        var percentile = document.createElement('td');

        name.innerHTML = testExamData[i].split(":")[0];
        score.innerHTML = testExamData[i].split(":")[1] + "%";
        percentile.innerHTML = getPercentile(testExamData[i], testExamData) + "th";

        var time = document.createElement('td');
        time.innerHTML = testExamData[i].split(":")[2] + " Mins";
        time.id = "time";

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        tr.appendChild(time);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild(table);

    }
    else if(func == " Sort By Alphabet (Z-A)") {
      testExamData.sort();

      var table = document.createElement('table');
      table.id = "random";
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";
      initName.id = "name";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"
      initScore.id = "score";

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";
      initPercentile.id = "percentile";

      var initTime = document.createElement('td');
      initTime.innerHTML = "Time";
      initTime.id = "time";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);
      init.appendChild(initTime);

      table.appendChild(init);

      for(var i = testExamData.length - 1; i >= 0; i--){
        var tr = document.createElement('tr');
        tr.onclick = function() { loadStudentExamData(testExamData[i].split(":")[0]); }

        table.appendChild(document.createElement('br'));

        var name = document.createElement('td');
        name.style.paddingLeft = "66px";
        var score = document.createElement('td');
        var percentile = document.createElement('td');

        name.innerHTML = testExamData[i].split(":")[0];
        score.innerHTML = testExamData[i].split(":")[1] + "%";
        percentile.innerHTML = getPercentile(testExamData[i], testExamData) + "th";

        var time = document.createElement('td');
        time.innerHTML = testExamData[i].split(":")[2] + " Mins";
        time.id = "time";

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        tr.appendChild(time);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild(table);
    }

    else if(func == " Sort By Score (high-low)") {
      var scores = mergeSort(testExamData);

      var table = document.createElement('table');
      table.id = "random";
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";
      initName.id = "name";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"
      initScore.id = "score";

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";
      initPercentile.id = "percentile";

      var initTime = document.createElement('td');
      initTime.innerHTML = "Time";
      initTime.id = "time";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);
      init.appendChild(initTime);

      table.appendChild(init);

      for(var i = 0; i < scores.length; i++){
        var tr = document.createElement('tr');
        tr.onclick = function() { loadStudentExamData(scores[i].split(":")[0]); }

        table.appendChild(document.createElement('br'));

        var name = document.createElement('td');
        name.style.paddingLeft = "66px";
        var score = document.createElement('td');
        var percentile = document.createElement('td');

        name.innerHTML = scores[i].split(":")[0];
        score.innerHTML = scores[i].split(":")[1] + "%";
        percentile.innerHTML = getPercentile(scores[i], scores) + "th";

        var time = document.createElement('td');
        time.innerHTML = testExamData[i].split(":")[2] + " Mins";
        time.id = "time";

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        tr.appendChild(time);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild(table);

    }
    else if(func == " Sort By Score (low-high)") {
      var scores = mergeSort(testExamData);

      var table = document.createElement('table');
      table.id = "random";
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";
      initName.id = "name";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"
      initScore.id = "score";

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";
      initPercentile.id = "percentile";

      var initTime = document.createElement('td');
      initTime.innerHTML = "Time";
      initTime.id = "time";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);
      init.appendChild(initTime);

      table.appendChild(init);

      for(var i = scores.length - 1; i >= 0; i--){
        var tr = document.createElement('tr');
        tr.onclick = function() { loadStudentExamData(scores[i].split(":")[0]); }

        table.appendChild(document.createElement('br'));

        var name = document.createElement('td');
        name.style.paddingLeft = "66px";
        var score = document.createElement('td');
        var percentile = document.createElement('td');

        name.innerHTML = scores[i].split(":")[0];
        score.innerHTML = scores[i].split(":")[1] + "%";
        percentile.innerHTML = getPercentile(scores[i], scores) + "th";

        var time = document.createElement('td');
        time.innerHTML = testExamData[i].split(":")[2] + " Mins";
        time.id = "time";

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        tr.appendChild(time);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild(table);

    }
    else if(func == " Sort By Time (high-low)") {
      var times = mergeSortTime(testExamData);

      var table = document.createElement('table');
      table.id = "random";
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";
      initName.id = "name";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"
      initScore.id = "score";

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";
      initPercentile.id = "percentile";

      var initTime = document.createElement('td');
      initTime.innerHTML = "Time";
      initTime.id = "time";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);
      init.appendChild(initTime);

      table.appendChild(init);

      for(var i = times.length - 1; i >= 0; i--){
        var tr = document.createElement('tr');
        tr.onclick = function() { loadStudentExamData(times[i].split(":")[0]); }

        table.appendChild(document.createElement('br'));

        var name = document.createElement('td');
        name.style.paddingLeft = "66px";
        var score = document.createElement('td');
        var percentile = document.createElement('td');

        name.innerHTML = times[i].split(":")[0];
        score.innerHTML = times[i].split(":")[1] + "%";
        percentile.innerHTML = getPercentile(times[i], times) + "th";

        var time = document.createElement('td');
        time.innerHTML = times[i].split(":")[2] + " Mins";
        time.id = "time";

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        tr.appendChild(time);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild(table);
    }
    else if(func == " Sort By Time (low-high)") {
      var times = mergeSortTime(testExamData);

      var table = document.createElement('table');
      table.id = "random";
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";
      initName.id = "name";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"
      initScore.id = "score";

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";
      initPercentile.id = "percentile";

      var initTime = document.createElement('td');
      initTime.innerHTML = "Time";
      initTime.id = "time";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);
      init.appendChild(initTime);

      table.appendChild(init);

      for(var i = 0; i < times.length; i++){
        var tr = document.createElement('tr');
        tr.onclick = function() { loadStudentExamData(times[i].split(":")[0]); }

        table.appendChild(document.createElement('br'));

        var name = document.createElement('td');
        name.style.paddingLeft = "66px";
        var score = document.createElement('td');
        var percentile = document.createElement('td');

        name.innerHTML = times[i].split(":")[0];
        score.innerHTML = times[i].split(":")[1] + "%";
        percentile.innerHTML = getPercentile(times[i], times) + "th";

        var time = document.createElement('td');
        time.innerHTML = times[i].split(":")[2] + " Mins";
        time.id = "time";

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        tr.appendChild(time);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild(table);
    }
  }
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
function merge(left, right) {
  let result = []
  let indexLeft = 0
  let indexRight = 0

  while (indexLeft < left.length && indexRight < right.length) {
    if (left[indexLeft].split(":")[1] < right[indexRight].split(":")[1]) {
      result.push(left[indexLeft])
      indexLeft++
    } else {
      result.push(right[indexRight])
      indexRight++
    }
  }

  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
}

//implement merge sort
function mergeSortTime (arr) {
  if (arr.length === 1) {
    // return once we hit an array with a single item
    return arr
  }

  const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
  const left = arr.slice(0, middle) // items on the left side
  const right = arr.slice(middle) // items on the right side

  return mergeTime(
    mergeSortTime(left),
    mergeSortTime(right)
  )
}

// compare the arrays item by item and return the concatenated result
function mergeTime(left, right) {
  let result = []
  let indexLeft = 0
  let indexRight = 0

  while (indexLeft < left.length && indexRight < right.length) {
    if (left[indexLeft].split(":")[2] < right[indexRight].split(":")[2]) {
      result.push(left[indexLeft])
      indexLeft++
    } else {
      result.push(right[indexRight])
      indexRight++
    }
  }

  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
}

// search and parse through exams based on value
function searchExams() {
  var input, filter, ul, li, a, i, txtValue;

  input = document.getElementById("exam-search");
  filter = input.value.toUpperCase();

  ul = document.getElementById("exam-wrapper");
  li = ul.getElementsByClassName("examBox");

  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("span")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
    } else {
        li[i].style.display = "none";
    }
  }
}

// create div based on name and avg
function createExamBox(name, classAvg, ref, code) {
  var gradients = [
    "linear-gradient( 135deg, #FEB692 10%, #EA5455 100%)",
    "linear-gradient( 135deg, #72EDF2 10%, #5151E5 100%)",
    "linear-gradient( 135deg, #ABDCFF 10%, #0396FF 100%)"
  ];

  var wrapper = document.getElementById('exam-wrapper');

  var classBox = document.createElement('div');
  classBox.className = "examBox";
  classBox.style.background = "white";

  classBox.onclick = function() {
    displayExamData(name);
    document.getElementById("this-exam").innerHTML = name;
  };

  firebase.database().ref(ref).on('value', function(snapshot) {
    for(var obj in snapshot.val()) {
      if(snapshot.val()[obj].examCode == code && snapshot.val().responses == undefined) {
        classBox.onclick = function() {
          document.getElementById('create-exam').style.display = "initial";
          document.getElementById('main').style.display = "none";
          document.body.style.background = "white";

          populateExam(code, ref);
        };
      }
    }
  });

  var difBackground = document.createElement('div')
  difBackground.style.background = gradients[Math.floor(Math.random()*(3) + 0)];
  difBackground.style.borderRadius= "10px 10px 0 0";
  difBackground.className = 'wave';

  var span = document.createElement('span');
  if(name == "") {
    name = code;
  }

  span.innerHTML = name;
  span.style.marginLeft = "40px";
  span.style.color = "white";
  span.className = 'examName';

  var option_vertical = document.createElement('span');
  option_vertical.className = "glyphicon glyphicon-option-vertical";
  option_vertical.style.float = "right";
  option_vertical.style.padding = "10px";
  option_vertical.style.display = "inline";

  difBackground.appendChild(span);
  difBackground.appendChild(option_vertical);
  difBackground.appendChild(document.createElement('hr'));
  classBox.appendChild(difBackground);

  if(classAvg == 'NaN') {
    var descriptor = document.createElement('span');
    descriptor.innerHTML = "No Responses!";

    var button = document.createElement('button');
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.padding = "10px";
    button.style.marginTop = "10px";
    button.style.boxShadow = "3px 5px lightgray"
    button.innerHTML = "Display Exam Info";

    button.onmouseover = function() {
      this.style.transform = "translate(2px)";
    }

    button.onmouseleave = function() {
      this.style.transform = "translate(0px)";
      this.style.transition = "all .5s";
    }

    button.onclick = function() {
      classBox.onclick = function() {};

      document.getElementById('main').style.display = "none";
      document.getElementById('create-exam').style.display = "none";
      document.getElementById('display').style.display = "block";
      document.getElementById('display-code').innerHTML = code;
      document.body.style.backgroundImage = "none";

      firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/" + code + "/currentlyTaking/").on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          createCurrentTakingBox(retrieveName(childSnapshot.val()));
        });
      });
    }

    classBox.appendChild(descriptor);
    classBox.appendChild(document.createElement('br'));
    classBox.appendChild(button);
  }

  else {
    var letter = document.createElement('span');
    letter.innerHTML = getLetter(classAvg);
    letter.style.color = "#2e2f7d";
    letter.style.fontSize = "90px";

    var descriptor = document.createElement('span');
    descriptor.innerHTML = "Class Average (" + classAvg + ")";

    classBox.appendChild(letter);
    classBox.appendChild(document.createElement('br'));
    classBox.appendChild(descriptor);
  }

  wrapper.appendChild(classBox);
  document.getElementById('main').appendChild(wrapper);
}

//get student name by ID
function retrieveName(id) {
  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Students/").on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val().split(";")[0] == id){
        return childSnapshot.val().split(";")[1];
      }
    });
  });

  return "Not Found";
}

// create currentlyTaking box
function createCurrentTakingBox(name) {
  var currentlyTakingDiv = document.getElementById('joined-students');
  var gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(to top, #a3bded 0%, #6991c7 100%)",
    "linear-gradient(60deg, #29323c 0%, #485563 100%)",
    "linear-gradient(-60deg, #ff5858 0%, #f09819 100%)",
    "linear-gradient(to top, #4481eb 0%, #04befe 100%)",
    "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
    "linear-gradient(-225deg, #A445B2 0%, #D41872 52%, #FF0066 100%)"
  ];

  var box = document.createElement('div');
  box.id = 'currentlyTakingBox';
  box.style.backgroundImage = gradients[Math.floor(Math.random()*gradients.length)];
  box.innerHTML = name;

  var center = document.createElement('center');
  center.appendChild(box);

  currentlyTakingDiv.appendChild(center);
}

//delete current exam
function deleteExam() {
  var code = document.getElementById('exam-code').innerHTML;
  var modifiedCode = "";

  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this exam!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      var data = false;

      firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createExamClass') + "/Exams/").once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          if(childSnapshot.key.substring(1) == code) {
            modifiedCode = childSnapshot.key;
          }
        });
        firebase.database().ref('Teachers/' + userName + "/Classes/" + localStorage.getItem('className') + "/Exams/" + modifiedCode).remove();

        var ref = (firebase.database().ref('Teachers/' + userName + "/Classes/" + localStorage.getItem('className') + "/Exams/"));
        ref.once('value', function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            data = true;
          });
          if(!data) {
            ref.push("no_exams");
          }
        });
      });

      firebase.database().ref('exam-codes').on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          if(childSnapshot.val().split(";")[0] == code){
            firebase.database().ref('exam-codes').child(childSnapshot.key).remove();
          }
        });
      });

      document.getElementById('create-exam').style.display = "none";
      document.getElementById('main').style.display = "initial";
      document.body.style.background = "white";

      $("#exam-wrapper").empty();
      $( "#exam" ).empty();

      loadClass(localStorage.getItem("className"));

      if(localStorage.getItem("CreatedExamCode").toUpperCase() == code) {
        localStorage.setItem("CreatedExamCode", "");
        document.getElementById('cached-exam-button').remove();
      }

      swal("Poof! Your exam has been deleted!", {
        icon: "success",
      });
    }
  });
}

//function to restructure if question is deleted in the middle
function restructureQuestions() {
  var questions = document.getElementsByClassName('question');

  for(var i = 0; i < questions.length; i++) {
    var question = questions[i];

    question.childNodes[0].innerHTML = i + 1 + ". "
    question.id = i + 1;
  }
}

// function to restructure matching boxes
function restructureBoxes() {
  var boxes = document.getElementsByClassName('matchingbox');

  for(var i = 0; i < boxes.length; i++) {
    var box = questions[i];

    box.childNodes[1].innerHTML = i + 1 + ". "
  }
}

//function to dynamically change type of question
function changeQuestionType(val, i, prevVal) {
  var plus = i + 1;
  var plusDiv = document.getElementById(plus);

  if(val != prevVal) {
    for(var j = 0; j < plusDiv.childNodes.length; j++) {
      if(plusDiv.childNodes[j].className == prevVal) {
        plusDiv.childNodes[j].style.display = "none";
      }
    }

    if(val == "mc") {
      document.getElementsByClassName("mc")[i].style.display = "initial";
    }

    else if(val == "fr") {
      document.getElementsByClassName("mc")[i].style.display = "none";
      document.getElementById(plus).appendChild(createFreeResponse());
    }
    else if(val == "tf") {
      document.getElementsByClassName("mc")[i].style.display = "none";
      document.getElementById(plus).appendChild(createTrueFalse());
    }
    else if(val == "matching") {
      document.getElementsByClassName("mc")[i].style.display = "none";
      document.getElementById(plus).appendChild(createMatching());
    }
  }
}


// True | False
function createTrueFalse() {
  var label = document.createElement('label');
  label.id = "label";
  label.className = "tf";

  var true_input = document.createElement('input');
  true_input.style.outline = "none";
  true_input.type = "radio";
  true_input.className = "option-input radio";
  true_input.name = "tf";

  var false_input = document.createElement('input');
  false_input.style.outline = "none";
  false_input.type = "radio";
  false_input.className = "option-input radio";
  false_input.name = "tf";
  false_input.style.marginLeft = "10%";

  var true_span = document.createElement('span');
  true_span.innerHTML = " True";
  true_span.style.marginLeft = "10px";
  true_span.style.color = "gray"
  true_span.style.fontWeight = 'normal';

  var false_span = document.createElement('span');
  false_span.innerHTML = " False";
  false_span.style.marginLeft = "10px";
  false_span.style.color = "gray"
  false_span.style.fontWeight = 'normal';

  label.appendChild(true_input);
  label.appendChild(true_span)

  label.appendChild(false_input);
  label.appendChild(false_span)

  return label;
}

// function for Free-Response
function createFreeResponse() {
  var ta = document.createElement('textarea');
  ta.readOnly = true;
  ta.className = "fr";
  ta.placeholder = "NOTE: This question type requires manual grading";

  return ta;
}


// function to create matching boxes
function createMatching(){
  var matchingWrapper = document.createElement('div');
  matchingWrapper.className = "matching-wrapper";

  var matching = document.createElement('div');
  matching.className = 'matching';

  var hr = document.createElement('hr');
  hr.style.width = '67%';

  var questions = document.createElement('span');
  questions.innerHTML = 'Questions';
  questions.style.marginLeft = "1.5vw";

  var results = document.createElement('span');
  results.innerHTML = 'Results (Will Be Randomized)'
  results.style.marginLeft = "22.5vw";

  var numElements = document.createElement('input');
  numElements.type = 'textbox';
  numElements.placeholder = '# Of Elements...';
  numElements.style.borderRadius = "5px";
  numElements.style.padding = "5px";
  numElements.style.border= "1px solid black";
  numElements.style.fontSize = "15px";

  numElements.onkeyup = function() {
    $(matchingWrapper).empty();

    if(this.value <= 20) {
      for(var i = 0; i < this.value; i++) {
        createMatchingElement(matchingWrapper, i + 1);
      }
    }
    else {
      this.value = "";

      var alert = document.createElement('div');
      alert.innerHTML = "20 Elements Max!"
      alert.style.textAlign = "center";
      alert.style.width = "100%";
      alert.style.position = "fixed";
      alert.style.zIndex = "100000";
      alert.style.top = "0";
      alert.className = "alert alert-danger";
      alert.role = "alert";

      document.getElementById('create-exam').appendChild(document.createElement('center').appendChild(alert));

      setTimeout(function(){ document.getElementsByClassName('alert')[0].remove(); }, 2500);
    }
  }

  var newBox = document.createElement('button');
  newBox.id = "newBox";
  newBox.innerHTML = "New Element!";

  newBox.onclick = function() {
    createMatchingElement(matchingWrapper, document.getElementsByClassName('matchingbox').length + 1);
    saveExam(false);
  }

  matching.appendChild(numElements);
  matching.appendChild(hr);
  matching.appendChild(questions); matching.appendChild(results);
  matching.appendChild(matchingWrapper);

  matching.appendChild(document.createElement('br'));
  matching.appendChild(newBox);

  return matching;
}

// function to create matching Elements
function createMatchingElement(div, i) {
  var box = document.createElement('div');
  box.className = 'matchingbox';

  var labelTrash = document.createElement('span');
  labelTrash.className = "glyphicon glyphicon-minus";
  labelTrash.style.display = "none";
  labelTrash.style.marginRight = "5px";
  labelTrash.style.color = "#f25555";

  $(labelTrash).click(function(){
    this.parentNode.remove();
    saveExam(false);
    restructureBoxes();
  });

  $(box).hover(function(){
    this.childNodes[0].style.display = "initial";
  }, function(){
    this.childNodes[0].style.display = "none";
  });

  $(labelTrash).hover(function(){
    this.style.cursor="pointer";
    this.style.color = "#f25555";
  }, function(){

  });

  box.appendChild(labelTrash)

  var num = document.createElement('span');
  num.innerHTML = i + ".";
  num.style.marginRight = "10px";
  num.style.fontSize = "15px";

  box.appendChild(num);

  var input = document.createElement('input');
  input.type = 'textbox';
  input.style.marginTop = "20px";
  input.style.textAlign = "center";
  input.placeholder = "1 + 1";
  input.id = 'result';

  var arrow = document.createElement('span');
  arrow.className = 'glyphicon glyphicon-arrow-right';
  arrow.style.paddingLeft = '5vw';

  var result_input = document.createElement('input');
  result_input.type = 'textbox';
  result_input.style.marginLeft = "5vw";
  result_input.style.textAlign = "center";
  result_input.placeholder = "2";
  result_input.id = 'result';

  box.appendChild(input);
  box.appendChild(arrow);
  box.appendChild(result_input);
  div.appendChild(box);
}

function restructureManager() {
  $('#question-manager').empty();

  for(var i = 0; i < document.getElementsByClassName('question').length; i++) {
    createQuestionTracker(i + 1, false);
  }
}

// function to create HTML question
function createQuestion(loading, numAnswerChoices) {
  var exam = document.getElementById('exam');

  var question = document.createElement('div');
  question.className = "question";
  question.id = document.getElementsByClassName('question').length + 1;

  var num = document.createElement('span');
  num.innerHTML = document.getElementsByClassName('question').length + 1 + ". ";
  num.style.color = "#97a5aa";

  var hr = document.createElement('hr');
  var br = document.createElement('br');

  var trash = document.createElement('span');
  trash.className = "glyphicon glyphicon-trash";
  trash.style.display = "none";
  trash.style.marginRight = "5px";
  trash.style.color = "lightgray";

  $(trash).click(function(){
    question.remove(); hr.remove(); br.remove();
    restructureManager(); restructureQuestions(); saveExam();
  });

  $(trash).hover(function(){
    trash.style.cursor="pointer";
    trash.style.color = "black";
  }, function(){
    trash.style.color = "lightgray";
  });

  var moveDiv = document.createElement('span');
  moveDiv.id = "moveDiv"
  moveDiv.className = "glyphicon glyphicon-refresh";
  moveDiv.style.display = "none";
  moveDiv.style.marginRight = "5px";

  $(moveDiv).click(function(){
    if(!swapDiv(this.parentNode, prompt("Which Question (#) Would You Like To Swap With?"))){
      swal("Failed!", "The Number You Provided Does Not Exist", "error");
    }
    else {
      saveExam(false);
    }
  });

  var imgUpload = document.createElement('span');
  imgUpload.className = "glyphicon glyphicon-picture";
  imgUpload.style.display = "none";
  imgUpload.style.marginRight = "7px";
  imgUpload.style.color = "lightgray";

  imgUpload.onclick = function() {
    uploadImage(num.innerHTML.substring(0, num.innerHTML.indexOf(".")));
  }

  $(imgUpload).hover(function(){
    imgUpload.style.cursor="pointer";
    imgUpload.style.color = "black";
  }, function(){
    imgUpload.style.color = "lightgray";
  });

  $(question).hover(function(){
    num.style.display = "none";
    trash.style.display = "initial";
    moveDiv.style.display = "initial";
    imgUpload.style.display = "initial";
    num.style.cursor = "pointer";
  }, function(){
    num.style.display = "initial";
    trash.style.display = "none";
    imgUpload.style.display = "none";
    moveDiv.style.display = "none";
  });


  var question_title = document.createElement('input');
  question_title.type = "text";
  question_title.placeholder = "Ex: What's Your Name?";
  question_title.id = "question-title";

  var question_type = document.createElement('select');
    var mc = document.createElement('option'); mc.value = "mc"; mc.innerHTML = "Multiple Choice";
    var fr = document.createElement('option'); fr.value = "fr"; fr.innerHTML = "Free Response";
    var tf = document.createElement('option'); tf.value = "tf"; tf.innerHTML = "True | False";
    // var matching = document.createElement('option'); matching.value = "matching"; matching.innerHTML = "Matching"

  question_type.appendChild(mc); question_type.appendChild(fr); question_type.appendChild(tf); //question_type.appendChild(matching);
  question_type.id = "question-type";

  var previous;

  $(question_type).on('focusin', function(){
    previous = $(this).val();
  });

  question_type.onchange = function() {
    changeQuestionType(this.children[this.selectedIndex].value, question.id - 1, previous);
    question_type.blur();
  }

  question.appendChild(num);
  question.appendChild(imgUpload);
  question.appendChild(moveDiv);
  question.appendChild(trash);
  question.appendChild(question_title);
  question.appendChild(question_type);

  var points = document.createElement('div');
  var span = document.createElement('span');
  span.innerHTML = "( ";

  var numPoints = document.createElement('input');
  numPoints.type = "text";
  numPoints.id = "numPoints";
  numPoints.className = "numPoints";
  numPoints.placeholder = "Ex: 4";

  var finishingSpan =  document.createElement('span');
  finishingSpan.innerHTML = " points)";

  points.appendChild(span); points.appendChild(numPoints); points.appendChild(finishingSpan);

  question.appendChild(points);

  var answer_choices = document.createElement('div');
  answer_choices.className = "mc";

  for(var i = 0; i < numAnswerChoices; i++) {
    var label = document.createElement('label');
    label.id = "label";

    var input = document.createElement('input');
    input.style.outline = "none";
    input.type = "radio";
    input.className = "option-input radio";
    input.name = num.innerHTML;

    var answer_choice = document.createElement('input');
    answer_choice.className = "option";
    answer_choice.id = "question-choice";
    answer_choice.type="text";
    answer_choice.placeholder = " Answer Choice...";

    var labelTrash = document.createElement('span');
    labelTrash.className = "glyphicon glyphicon-minus";
    labelTrash.style.display = "none";
    labelTrash.style.marginRight = "5px";
    labelTrash.style.color = "#f25555";

    $(labelTrash).click(function(){
        this.parentNode.remove();
        saveExam();
    });
    $(label).hover(function(){
      this.childNodes[0].style.display = "initial";
    }, function(){
      this.childNodes[0].style.display = "none";
    });

    $(labelTrash).hover(function(){
      this.style.cursor="pointer";
      this.style.color = "#f25555";
    }, function(){});


    label.appendChild(labelTrash)
    label.appendChild(input);
    label.appendChild(answer_choice);
    answer_choices.appendChild(label);
  }

  var plus = document.createElement('span');
  plus.className = "glyphicon glyphicon-plus";

  var createNewAnswerChoice = document.createElement('a');
  createNewAnswerChoice.id = "createNewAnswerChoice";
  createNewAnswerChoice.href = "javascript:createNewOptionChoice(" +  num.innerHTML + ")";
  createNewAnswerChoice.appendChild(plus);
  createNewAnswerChoice.innerHTML += ' New Answer Choice'

  answer_choices.appendChild(createNewAnswerChoice);

  question.appendChild(answer_choices);
  exam.appendChild(question);

  exam.appendChild(br);
  exam.appendChild(hr);


  if(!loading) {
    window.scroll({ top: question.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    createQuestionTracker(document.getElementsByClassName('question').length, false);
    saveExam(false);
  }
}

// upload images
function uploadImage(num) {
  swal({
        title: 'title',
        html: true,
        text: "<input type='file' id='fileToUploadAlert' accept='image/*'>\n",
        showCancelButton: true,
        confirmButtonColor: "#07A803",
        confirmButtonText: "Upload",
        closeOnConfirm: false,
        showLoaderOnConfirm: true
    }, function () {
        var files = $('input#fileToUploadAlert').prop('files');
        if (files.length === 0) {
            swal.showInputError("You need to upload a file!");
            return false
        }

        callback(files[0]);
    });

  // var thefile = document.getElementById('input');
  // var reader = new FileReader();
  //
  // reader.onloadend = function(){
  //     var imagem = reader.result;
  // }
  // if(thefile){
  //     reader.readAsDataURL(thefile);
  // }
  //
  // swal({
  //   title: "Esta é a imagem que pretende inserir?",
  //   text: "<img src='"+imagem+"' style='width:150px;'>",
  //   html:true,
  // });
}

//function to swap divs
function swapDiv(elem, numToSwap){
  if(document.getElementById(numToSwap) == undefined) {
    return false;
  }
  else {
    var div1 = jQuery(elem);
  	var div2 = jQuery(document.getElementById(numToSwap));

  	var tdiv1 = div1.clone();
  	var tdiv2 = div2.clone();

		div1.replaceWith(tdiv2);
		div2.replaceWith(tdiv1);

    restructureQuestions();
    return true;
  }
}

// append new answer choice to question based on num
function createNewOptionChoice(num) {
  var val = document.getElementById(num).childNodes[6];
  val.childNodes[val.childNodes.length - 1].remove();

  var label = document.createElement('label');
  label.id = "label";

  var input = document.createElement('input');
  input.style.outline = "none";
  input.type = "radio";
  input.className = "option-input radio";
  input.name = "radio";

  var answer_choice = document.createElement('input');
  answer_choice.className = "option";
  answer_choice.id = "question-choice";
  answer_choice.type="text";
  answer_choice.placeholder = " Answer Choice...";

  var answer_choice = document.createElement('input');
  answer_choice.className = "option";
  answer_choice.id = "question-choice";
  answer_choice.type="text";
  answer_choice.placeholder = " Answer Choice...";

  var labelTrash = document.createElement('span');
  labelTrash.className = "glyphicon glyphicon-minus";
  labelTrash.style.display = "none";
  labelTrash.style.marginRight = "5px";
  labelTrash.style.color = "#f25555";

  $(labelTrash).click(function(){
      this.parentNode.remove();
      saveExam();
  });

  $(label).hover(function(){
    this.childNodes[0].style.display = "initial";
  }, function(){
    this.childNodes[0].style.display = "none";
  });

  $(labelTrash).hover(function(){
    this.style.cursor="pointer";
    this.style.color = "#f25555";
  }, function(){

  });

  label.appendChild(labelTrash);
  label.appendChild(input);
  label.appendChild(answer_choice);
  val.appendChild(label);

  var plus = document.createElement('span');
  plus.className = "glyphicon glyphicon-plus";

  var createNewAnswerChoice = document.createElement('a');
  createNewAnswerChoice.id = "createNewAnswerChoice";
  createNewAnswerChoice.href = "javascript:createNewOptionChoice(" +  num + ")";
  createNewAnswerChoice.appendChild(plus);
  createNewAnswerChoice.innerHTML += ' New Answer Choice';

  val.appendChild(createNewAnswerChoice);
  saveExam(false);
}

// return letter grade based on avg
function getLetter(avg) {
  if(avg >= 90.0) {
    return "A";
  }
  else if(avg < 90.0 && avg >= 80.0) {
    return "B";
  }
  else if(avg < 80.0 && avg >= 70.0) {
    return "C";
  }
  else if(avg < 70.0 && avg >= 60.0) {
    return "D";
  }
  else {
    return "F";
  }

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
  document.getElementById('main').appendChild(wrapper);
}

//populate main dashboard of page when page loads
function populateDashboard() {
  if(!userDataHasLoaded) {
    var ref = firebase.database().ref('Teachers');
    var counter = 0;
    var exists = false;

    ref.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.key == userName) {
          exists = true;
          arr.push(childSnapshot.child("Classes").val());

          for (var key in arr) {
            var x = 0;
            // skip loop if the property is from prototype
            if (!arr.hasOwnProperty(key)) continue;
            var obj = arr[key];
            for (var prop in obj) {
              // skip loop if the property is from prototype
              if(!obj.hasOwnProperty(prop)) continue;

              if(obj[prop].Exams[Object.keys(obj[prop].Exams)[0]] == "no_exams") {
                createClassBox(prop, Object.keys(obj[prop].Students).length, 0);
              }

              else {
                createClassBox(prop, Object.keys(obj[prop].Students).length, Object.keys(obj[prop].Exams).length);
              }
            }
          }
        }
      });
      if(!exists) {
        document.getElementById('doesNotExist').style.display = "initial";
      }
    });
  }

  userDataHasLoaded = true;
}
