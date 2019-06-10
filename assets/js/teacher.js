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

  $('.dropdown-toggle').click(function(){
    $('.dropdown-menu').toggleClass('show');
  });
};

// retrieve userName, img from localStorage
var userName = (JSON.parse(localStorage.getItem("userInfo"))[1]);
var profileImg = (JSON.parse(localStorage.getItem("userInfo"))[2]);

//initialize aspects of page with JS data
document.getElementById('welcome-text').innerHTML = "Welcome " + userName + "!";
document.getElementById('profile').src = profileImg;


// FOR SWITCHING TABS
function display(title) {
  $('.dropdown-menu').toggleClass('show');

  if(title == '<a href="#">Ping-Pong</a>') {
    document.getElementById('main').style.display = "none";
    document.getElementById('pong').style.display = "initial";
  }
  else if(title == '<a href="#">Dashboard</a>') {
    document.getElementById('main').style.display = "initial";
    document.getElementById('pong').style.display = "initial";
  }
}

function removeAllActive() {
  document.getElementsByTagName("LI")[0].className = "";
  document.getElementsByTagName("LI")[1].className = "";
}


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

// function to display all data in the table by className
function displayExamData(name) {
    var cumAvg = 0;
    var classLength = 0;
    var highest = "a:-1000";
    var lowest = "a:1000";

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

    $('.dropdown').click(function(){
      $('.dropdown-menu').toggleClass('show');
    });

    document.getElementById('main').appendChild;(document.createElement('br'));
    document.getElementById('main').appendChild;(i);


    for (var key in exams) {
      // skip loop if the property is from prototype
      if (!arr.hasOwnProperty(key)) continue;
      var obj = exams[key];
      for (var prop in obj) {

        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;

        if(prop == name) {
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

          var initScore = document.createElement('td');
          initScore.innerHTML = "Score (%)"

          var initPercentile = document.createElement('td');
          initPercentile.innerHTML = "Percentile";

          init.appendChild(initName);
          init.appendChild(initScore);
          init.appendChild(initPercentile);

          table.appendChild(init);

          for (var exam in obj[prop]) {
            examData.push(obj[prop][exam]);
            cumAvg += parseInt(obj[prop][exam].split(":")[1]);
            classLength = Object.keys(obj[prop]).length;

            if(parseInt(obj[prop][exam].split(":")[1]) > parseInt(highest.split(":")[1])) {
              highest = obj[prop][exam];
            }

            if(parseInt(obj[prop][exam].split(":")[1]) < parseInt(lowest.split(":")[1])) {
              lowest = obj[prop][exam];
            }

            var tr = document.createElement('tr');
            table.appendChild(document.createElement('br'));

      			var name = document.createElement('td');
            name.style.paddingLeft = "66px";
      			var score = document.createElement('td');
      			var percentile = document.createElement('td');

      			name.innerHTML = obj[prop][exam].split(":")[0];
      			score.innerHTML = obj[prop][exam].split(":")[1] + "%";
      			percentile.innerHTML = getPercentile(obj[prop][exam], obj[prop]) + "th";

      			tr.appendChild(name);
      			tr.appendChild(score);
      			tr.appendChild(percentile);
      			table.appendChild(tr);

            random.appendChild(table);
            document.getElementById('main').appendChild;(random);
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
    table.className = "table table-striped";
    table.style.width = "100vw";

    var init = document.createElement('tr');
    init.style.color = "darkgray";

    var initName = document.createElement('td');
    initName.innerHTML = "Name";
    initName.style.paddingLeft = "66px";

    var initScore = document.createElement('td');
    initScore.innerHTML = "Score (%)"

    var initPercentile = document.createElement('td');
    initPercentile.innerHTML = "Percentile";

    init.appendChild(initName);
    init.appendChild(initScore);
    init.appendChild(initPercentile);

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

      tr.appendChild(name);
      tr.appendChild(score);
      tr.appendChild(percentile);
      table.appendChild(tr);
    }

    document.getElementById('main').appendChild;(table);
  }
  else {
    if(func == " Sort By Alphabet (A-Z)"){
      testExamData.sort();

      var table = document.createElement('table');
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);

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

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild;(table);

    }
    else if(func == " Sort By Alphabet (Z-A)") {
      testExamData.sort();

      var table = document.createElement('table');
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);

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

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild;(table);

    }

    else if(func == " Sort By Score (high-low)") {
      var scores = mergeSort(testExamData);

      var table = document.createElement('table');
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);

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

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild;(table);

    }
    else if(func == " Sort By Score (low-high)") {
      var scores = mergeSort(testExamData);

      var table = document.createElement('table');
      table.className = "table table-striped";
      table.style.width = "100vw";

      var init = document.createElement('tr');
      init.style.color = "darkgray";

      var initName = document.createElement('td');
      initName.innerHTML = "Name";
      initName.style.paddingLeft = "66px";

      var initScore = document.createElement('td');
      initScore.innerHTML = "Score (%)"

      var initPercentile = document.createElement('td');
      initPercentile.innerHTML = "Percentile";

      init.appendChild(initName);
      init.appendChild(initScore);
      init.appendChild(initPercentile);

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

        tr.appendChild(name);
        tr.appendChild(score);
        tr.appendChild(percentile);
        table.appendChild(tr);
      }

      document.getElementById('main').appendChild;(table);

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
function merge (left, right) {
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
  document.getElementById('main').appendChild;(wrapper);
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
  document.getElementById('main').appendChild;(wrapper);
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
