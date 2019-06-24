// check if user is signed in
if(localStorage.getItem('userInfo') == null) {
  document.getElementById('body').style.display = "none";
  alert("NOT AUTHORIZED");
}

var examCodes = [];
var examCodesTeachers = [];
var arr = [];
var exams = [];
var examData = [];

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

};

// retrieve userName, img from localStorage
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

  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createQuizClass') + "/Exams/" + randomCode.toUpperCase()).push(examInit);

  createQuestion();

  document.getElementById('create-exam').style.display = "initial";
  document.getElementById('main').style.display = "none";
  document.body.style.background = "white";
  document.getElementById('exam-code').innerHTML = randomCode.toUpperCase();

  var dbRef = firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createQuizClass') + "/Exams/" + randomCode.toUpperCase());

}

function saveExam() {
  var newSave = new Date().toLocaleString().replace(",", " @");
  document.getElementById('last-saved').innerHTML = "Last Saved: " + newSave;

  var examInit = {
    examCode: document.getElementById('exam-code').innerHTML,
    examTitle: document.getElementById('nameOfExam').value,
    lastSaved: newSave,
    examType: document.getElementById('type-of-exam').value,
    examTotalPoints: document.getElementsByClassName('points')[0].value,
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
    jsonArg1.title = children[2].value;
    jsonArg1.type = children[3].value;
    console.log(children);
    jsonArg1.points = children[4].childNodes[1].value
    jsonArg1.choices = [];

    for(var j = 0; j < children[5].childNodes.length - 1; j++){
      jsonArg1.choices.push(children[5].childNodes[j].childNodes[1].value);
    }

    pluginArrayArg.push(jsonArg1);
    var questions = JSON.parse(JSON.stringify(pluginArrayArg))
    $.extend(examInit, { questions });
  }

  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createQuizClass') + "/Exams/" + document.getElementById('exam-code').innerHTML).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.key != "responses") {
        firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createQuizClass') + "/Exams/" + document.getElementById('exam-code').innerHTML).child(childSnapshot.key).remove();
      }
    });
  });
  firebase.database().ref("Teachers/" + userName + "/Classes/" + localStorage.getItem('createQuizClass') + "/Exams/" + document.getElementById('exam-code').innerHTML).push(examInit);
}

//populate exam for autosave
function populateExam(code, ref) {
  firebase.database().ref(ref).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var val = childSnapshot.val();
      if(val.examCode != undefined){
        var counter = 0;

        document.getElementById('last-saved').innerHTML = "Last Saved: " + val.lastSaved;
        document.getElementById('exam-code').innerHTML = val.examCode;
        document.getElementById('date').value = val.examDate;
        document.getElementById('description').value = val.examDescription;
        document.getElementById('nameOfExam').value = val.examTitle;
        document.getElementsByClassName('points')[0].value = val.examTotalPoints;
        document.getElementsByClassName('time')[0].value = val.examTotalMins;
        document.getElementById('type-of-exam').value = val.examType;

        for(var i = 0; i < Object.keys(childSnapshot.val().questions).length; i++) {
          var localQuestions = document.getElementsByClassName('question');
          var question = childSnapshot.val().questions[i];
          createQuestion();

          console.log(localQuestions[i]);

          localQuestions[i].childNodes[2].value = question.title;
          localQuestions[i].childNodes[4].childNodes[1].value = question.points;
          localQuestions[i].childNodes[3].value = question.type;

          for(var j = 0; j < Object.keys(question.choices).length; j++){
            localQuestions[i].childNodes[5].childNodes[j].childNodes[1].value = (question.choices[j]);
          }
        }
      }
    });
  });
}

//load class based on name
function loadClass(name) {
  var examCounter = 0;
  var collectiveAvg = 0;
  var classAvg = 0;
  var classCounter = 0;
  var counter = -1

  document.getElementById('welcome-div').style.display = "none";
  document.getElementById('wrapper').style.display = "none";
  document.getElementById('classSpecific').style.display = "initial";
  document.getElementById('main-header').innerHTML = "Welcome to " + name;
  localStorage.setItem('createQuizClass', name);

  firebase.database().ref("Teachers/" + userName + "/Classes/" + name + "/Exams/").on('value', function(snapshot) {
    exams.push(snapshot.val());
    counter++;
    snapshot.forEach(function(childSnapshot) {
      childSnapshot.child('responses').forEach(function(exam) {
        classCounter++;
        examCounter++;
        var grade = exam.val().split(":")[1];
        collectiveAvg += parseInt(grade);

        classAvg += parseInt(grade);
      });

      for(var key in childSnapshot.val()) {
        createExamBox(childSnapshot.val()[key].examTitle, (classAvg / classCounter).toFixed(1), "Teachers/" + userName + "/Classes/" + name + "/Exams/" + childSnapshot.val()[key].examCode, childSnapshot.val()[key].examCode);

          var val = childSnapshot.val()[key].examTitle;

          var button = document.getElementById('cached-code');
          if(button != null) {
            button.id = "cached-exam-button";
            button.style.display = "inline";

            button.onclick = function() {
              document.getElementById('create-exam').style.display = "initial";
              document.getElementById('main').style.display = "none";
              document.body.style.background = "white";

              populateExam(localStorage.getItem("CreatedExamCode").toUpperCase(), "Teachers/" + userName + "/Classes/" + localStorage.getItem('createQuizClass') + "/Exams/" + localStorage.getItem("CreatedExamCode").toUpperCase());
            }
          }

          if(childSnapshot.val()[key].examTitle == ""){
            val = childSnapshot.val()[key].examCode;
          }

          document.getElementById('cached-exam-code').innerHTML = "Edit " + val;

        break;
      }
      classAvg = 0;
      classCounter = 0;
    });
    collectiveAvg = collectiveAvg / examCounter;
    collectiveAvg = (collectiveAvg).toFixed(1)
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
      className += string[i] + " "
    }
    else{
      className += string[i];
    }
  }

  if(examCodes.indexOf(code) == -1){
    firebase.database().ref("exam-codes").push(code.toUpperCase() + ";" + userName + ";" + className);
    localStorage.setItem("CreatedExamCode", code);
    return code;
  }
  else {
    generateCode();
  }
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

// function to display all data in the table by className
function displayExamData(name) {
  var cumAvg = 0;
  var classLength = 0;
  var highest = "a:-1000";
  var lowest = "a:1000";
  var quickest = "a:1000";
  var slowest = "a:-1000";

  document.getElementById('welcome-div').style.display = "none";
  document.getElementById('wrapper').style.display = "none";
  document.getElementById('classSpecific').style.display = "none";
  document.getElementById('exam-wrapper').style.display = "none";
  document.getElementById('examSpecific').style.display = "initial";
  document.getElementById('sort-menu').style.display = "initial";
  document.getElementById('exam-name').innerHTML = name;

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
        if(obj[prop][initData].examCode != undefined && Object.keys(obj[prop]).length == 2) {
          // skip loop if the property is from prototype
          if(!obj.hasOwnProperty(prop)) continue;

          if(obj[prop][initData].examTitle == name) {
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
        else if(Object.keys(obj[prop]).length == 2){
          for(var response in obj[prop].responses){
            examData.push(obj[prop].responses[response]);
            cumAvg += parseInt(obj[prop].responses[response].split(":")[1]);
            classLength = Object.keys(obj[prop].responses).length;

            if(parseInt(obj[prop].responses[response].split(":")[1]) > parseInt(highest.split(":")[1])) {
              highest = obj[prop].responses[response];
            }

            if(parseInt(obj[prop].responses[response].split(":")[1]) < parseInt(lowest.split(":")[1])) {
              lowest = obj[prop].responses[response];
            }

            var tr = document.createElement('tr');
            table.appendChild(document.createElement('br'));

      			var name = document.createElement('td');
            name.style.paddingLeft = "66px";
            name.id = "name";
      			var score = document.createElement('td');
      			var percentile = document.createElement('td');
            var time = document.createElement('td');

      			name.innerHTML = obj[prop].responses[response].split(":")[0];
            name.id = "name";

      			score.innerHTML = obj[prop].responses[response].split(":")[1] + "%";
            score.id = "score";

            time.innerHTML = obj[prop].responses[response].split(":")[2] + " Mins";
            time.id = "time";

      			percentile.innerHTML = getPercentile(obj[prop].responses[response], obj[prop].responses) + "th";
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


    ul.appendChild(avg);
    ul.appendChild(highestScorer);
    overallData.appendChild(document.createElement('br'));
    ul.appendChild(lowestScorer);
    overallData.appendChild(ul);
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
  }
  else if(title == '<a href="#">Dashboard</a>') {
    document.getElementById('main').style.display = "initial";
    document.getElementById('pong').style.display = "none";
    document.getElementById('leaderboard').style.display = "none";
    document.getElementById('feedback').style.display = "none";
  }
  else if(title == '<a href="#">Leaderboard</a>') {
    populateLeaderboard();
    document.getElementById('feedback').style.display = "none";
  }
  else if(title == '<a href="#">Feedback</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "none";
    document.getElementById('leaderboard').style.display = "none";
    document.getElementById('feedback').style.display = "initial";
  }
}

//function to calc perecntile range
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

      for(var i = scores.length - 1; i >= 0; i--){
        var tr = document.createElement('tr');
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

      for(var i = 0; i < scores.length; i++){
        var tr = document.createElement('tr');
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

// decide what to display based on selected value
function examTypeReactor(value) {
  switch(value) {
    case 'partner':
      document.getElementById('partner-chooser').style.display = "inline";
      document.getElementById('group-chooser').style.display = "none";
      break;
    case 'group':
      document.getElementById('group-chooser').style.display = "inline";
      document.getElementById('partner-chooser').style.display = "none";
      break;
    default:
      document.getElementById('partner-chooser').style.display = "none";
      document.getElementById('group-chooser').style.display = "none";
  }
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
  };

  firebase.database().ref(ref).on('value', function(snapshot) {
    for(var obj in snapshot.val()) {
      if(snapshot.val()[obj].examCode == code) {
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
    button.innerHTML = "Administer Test";

    button.onclick = function() {
      alert("x");
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

// function to create HTML question
function createQuestion() {
  var exam = document.getElementById('exam');

  var question = document.createElement('div');
  question.className = "question";
  question.id = document.getElementsByClassName('question').length + 1;

  var num = document.createElement('span');
  num.innerHTML = document.getElementsByClassName('question').length + 1 + ". ";
  num.style.color = "#97a5aa";

  var hr = document.createElement('hr');

  var trash = document.createElement('span');
  trash.className = "glyphicon glyphicon-trash";
  trash.style.display = "none";
  trash.style.marginRight = "5px";
  trash.style.color = "lightgray";

  $(trash).click(function(){
      question.remove(); hr.remove();
  });

  $(question).hover(function(){
    num.style.display = "none";
    trash.style.display = "initial";
    num.style.cursor = "pointer";

  }, function(){
    num.style.display = "initial";
    trash.style.display = "none";
  });

  $(trash).hover(function(){
    trash.style.cursor="pointer";
    trash.style.color = "black";
  }, function(){
    trash.style.color = "lightgray";
  });

  var question_title = document.createElement('input');
  question_title.type = "text";
  question_title.placeholder = "Ex: What's Your Name?";
  question_title.id = "question-title";

  var question_type = document.createElement('select');
    var mc = document.createElement('option'); mc.value = "mc"; mc.innerHTML = "Multiple Choice";
    var fr = document.createElement('option'); fr.value = "fr"; fr.innerHTML = "Free Response";
    var tf = document.createElement('option'); tf.value = "tf"; tf.innerHTML = "True | False";
    var matching = document.createElement('option'); matching.value = "matching"; matching.innerHTML = "Matching"

  question_type.appendChild(mc); question_type.appendChild(fr); question_type.appendChild(tf); question_type.appendChild(matching);
  question_type.id = "question-type";

  question.appendChild(num);
  question.appendChild(trash);
  question.appendChild(question_title);
  question.appendChild(question_type);

  var points = document.createElement('div');

  var span = document.createElement('span');
  span.innerHTML = "( ";

  var numPoints = document.createElement('input');
  numPoints.type = "text";
  numPoints.id = "numPoints";
  numPoints.placeholder = "Ex: 4";

  var finishingSpan =  document.createElement('span');
  finishingSpan.innerHTML = " points)";

  points.appendChild(span); points.appendChild(numPoints); points.appendChild(finishingSpan);

  question.appendChild(points);

  var answer_choices = document.createElement('div');

  for(var i = 0; i < 4; i++) {
    var label = document.createElement('label');
    label.id = "label";

    if(i == 0) {
      var input = document.createElement('input');
      input.style.outline = "none";
      input.type = "radio";
      input.className = "option-input radio";
      input.checked = true;
      input.name = "example";
    }
    else{
      var input = document.createElement('input');
      input.style.outline = "none";
      input.type = "radio";
      input.className = "option-input radio";
      input.name = "example";
    }

    var answer_choice = document.createElement('input');
    answer_choice.className = "option";
    answer_choice.id = "question-choice";
    answer_choice.type="text";
    answer_choice.placeholder = " Answer Choice...";

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

  exam.appendChild(document.createElement('br'));
  exam.appendChild(hr);

  //   <div id="exam">
  //     <div id="question">
  //        <span style="color: #97a5aa;">1.</span> &nbsp <input type="text" id="question-title" placeholder="Ex: What's Your Name?">
  //
  //       <select id="question-type">
  //         <option value="mc">Multiple Choice</option>
  //         <option value="fr">Free Response</option>
  //         <option value="tf">True | False</option>
  //         <option value="matching">Matching</option>
  //       </select>
  //
  //        (&nbsp <input id="numPoints" type="text" placeholder="Ex: 4"></input> points)
  //
  //       <div id="answer-choices">
  //         <label id="label">
  //           <input style="outline: none" type="radio" class="option-input radio" name="example" checked />
  //           <input class="option" id="question-choice" type="text" placeholder="Answer Choice"></input>
  //         </label>
  //         <br/>
  //         <label id="label">
  //           <input style="outline: none" type="radio" class="option-input radio" name="example" />
  //           <input class="option" id="question-choice" type="text" placeholder="Answer Choice"></input>
  //         </label>
  //         <br/>
  //         <label id="label">
  //           <input style="outline: none" type="radio" class="option-input radio" name="example" />
  //           <input class="option" id="question-choice" type="text" placeholder="Answer Choice"></input>
  //         </label>
  //         <br/>
  //         <label id="label">
  //           <input style="outline: none" type="radio" class="option-input radio" name="example" />
  //           <input class="option" id="question-choice" type="text" placeholder="Answer Choice"></input>
  //         </label>
  //
  //         <!-- <a href="#" onclick="createNewOptionChoice(this.parentElement.parentElement)">New Answer Choice</a> -->
  //       </div>
  //     </div>
  //     <hr/>
  //   </div>

  setTimeout(function(){ question.scrollIntoView({behavior: "smooth"}); }, 30);
}

function createNewOptionChoice(num) {
  var val = document.getElementById(num);

  var label = document.createElement('label');
  label.id = "label";

  var input = document.createElement('input');
  input.style.outline = "none";
  input.type = "radio";
  input.className = "option-input radio";
  input.name = "example";

  var answer_choice = document.createElement('input');
  answer_choice.className = "option";
  answer_choice.id = "question-choice";
  answer_choice.type="text";
  answer_choice.placeholder = " Answer Choice...";

  label.appendChild(input);
  label.appendChild(answer_choice);
  val.appendChild(label);

  var plus = document.createElement('span');
  plus.className = "glyphicon glyphicon-plus";

  var createNewAnswerChoice = document.createElement('a');
  createNewAnswerChoice.id = "createNewAnswerChoice";
  createNewAnswerChoice.href = "javascript:createNewOptionChoice(" +  num + ")";
  createNewAnswerChoice.appendChild(plus);
  createNewAnswerChoice.innerHTML += ' New Answer Choice'

  val.appendChild(createNewAnswerChoice);
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

              createClassBox(prop, Object.keys(obj[prop].Students).length, Object.keys(obj[prop].Exams).length);
          }
        }
      }
    });
    if(!exists) {
      document.getElementById('doesNotExist').style.display = "initial";
    }
  });

}
