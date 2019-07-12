var examCodes = [], students = [], done = [];
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
//         firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className + "/Exams/YQIMW/responses").push(name + ":" + Math.floor((Math.random() * 25) + 75) + ":" + Math.floor((Math.random() * 5) + 15));
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

// for displayQuiz()
window.onload = function() {
  $("#create-exam").on('change', "input:radio", function() {
    done[(this.parentNode.parentNode.parentNode.id - 1)] = 1;
    // document.getElementsByClassName(this.parentNode.parentNode.parentNode.id)[0].style.background = "green";
    //

    if(done.indexOf(0) == -1) {
      document.getElementById('submit-exam').disabled = false;
    }
  });

  $(window).scroll(function(){
    for(var i = 1; i <= document.getElementsByClassName('question').length; i++) {
      var waitTime = 3000;
      var elem = document.getElementById(i);
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();

      var elemTop = $(elem).offset().top;
      var elemBottom = elemTop + $(elem).height();

      var isInView = ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));

      if (isInView){
        document.getElementsByClassName(i)[0].style.bottom = '25px';
        document.getElementsByClassName(i)[0].style.transition = 'all .5s';

        var text = document.getElementsByClassName(i)[0].childNodes[1];
        document.getElementsByClassName(i)[0].innerHTML = "&#x25CF;"
        document.getElementsByClassName(i)[0].appendChild(text);
        document.getElementsByClassName(i)[0].childNodes[1].style.color = "white";
        document.getElementsByClassName(i)[0].childNodes[1].style.right = "22.5px";

        setTimeout(function(){
          document.getElementsByClassName(i)[0].style.bottom = '20px';
          document.getElementsByClassName(i)[0].style.transition = 'all .5s';
        }, waitTime);

      }
      else {
        document.getElementsByClassName(i)[0].style.bottom = '20px';
        document.getElementsByClassName(i)[0].style.transition = 'all .5s';

        var text = document.getElementsByClassName(i)[0].childNodes[1];
        document.getElementsByClassName(i)[0].innerHTML = "&#x25CC;"
        document.getElementsByClassName(i)[0].appendChild(text);
        document.getElementsByClassName(i)[0].childNodes[1].style.color = "black";
        document.getElementsByClassName(i)[0].childNodes[1].style.right = "22px";
      }
    }
  });
};

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
function displayQuiz() {
  var code = localStorage.getItem("ExamCode");
  localStorage.setItem("StudentName", document.getElementById('userName').innerHTML);
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
  console.log(plaintext)

  document.getElementById('main').style.display = "none";
  document.getElementById('navigation').style.display = "none";
  document.getElementById('display-exam').style.display = "initial";

  document.body.style.background = "white";
  document.body.style.overflow = "scroll";
  populateExam(code, firebase.database().ref("Teachers/" + plaintext.split(";")[1] + "/Classes/" + plaintext.split(";")[2] + "/Exams/" + code));
  toggleFullScreen();
}

//pull and populate exam
function populateExam(code, ref) {
  firebase.database().ref(ref).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var val = childSnapshot.val();
      if(val.examCode != undefined){
        var counter = 0;

        document.getElementById('exam-code').innerHTML = val.examCode + " | " + localStorage.getItem("StudentName");
        document.getElementById('date').innerHTML = val.examTeacher + " | " + val.examDate;
        document.getElementById('description').value = val.examDescription;
        document.getElementById('nameOfExam').innerHTML = val.examTitle;
        document.getElementsByClassName('points')[0].innerHTML = val.examTotalPoints;
        document.getElementsByClassName('time')[0].innerHTML = val.examTotalMins;

        for(var i = 0; i < Object.keys(val.questions).length; i++) {
          done.push(0);
          var localQuestions = document.getElementsByClassName('question');
          var question = childSnapshot.val().questions[i];

          createQuestion(true, Object.keys(question.choices).length);
          createQuestionTracker(i + 1, true);

          localQuestions[i].childNodes[1].value = question.title;
          localQuestions[i].childNodes[2].childNodes[1].innerHTML = question.points;

          changeQuestionType(question.type, i);

          if(question.type == "mc") {
            for(var j = 0; j < Object.keys(question.choices).length; j++){
              console.log(localQuestions[i].childNodes);
              if(question.choices[j].value != undefined){
                localQuestions[i].childNodes[3].childNodes[j].childNodes[1].innerHTML = (question.choices[j].value);
              }
              else {
                localQuestions[i].childNodes[3].childNodes[j].childNodes[1].innerHTML = (question.choices[j]);
              }
            }
          }

          else if(question.type == "tf") {
            console.log(localQuestions[i].childNodes);
            if(question.choices[0] == 'true') {
              localQuestions[i].childNodes[4].childNodes[0].checked = true;
            }
            else {
              localQuestions[i].childNodes[4].childNodes[2].checked = true;
            }
          }

          else if(question.type == "matching"){
            document.getElementsByClassName('matching')[i].childNodes[0].value = question.numBoxes;
            for(var j = 0; j < question.numBoxes; j++) {
              createMatchingElement(document.getElementsByClassName('matching-wrapper')[i], j + 1);
            }

            var localBoxes = document.getElementsByClassName('matchingbox');
            for(var k = 0; k < localBoxes.length; k++) {
              localBoxes[k].childNodes[1].value = question.choices[k].split(";")[0];
              localBoxes[k].childNodes[3].value = question.choices[k].split(";")[1];
            }
          }

        }
      }
    });
  });
}

//function to dynamically change type of question
function changeQuestionType(val, i) {
  if(val == "mc") {
    document.getElementsByClassName("mc")[i].style.display = "initial";

    if(document.getElementsByClassName("fr")[i] != undefined) {
      document.getElementsByClassName("fr")[i].style.display = "none";
    }

    if(document.getElementsByClassName("tf")[i] != undefined) {
      document.getElementsByClassName("tf")[i].style.display = "none";
    }

    if(document.getElementsByClassName("matching")[i] != undefined) {
      document.getElementsByClassName("matching")[i].style.display = "none";
    }
  }
  else if(val == "fr") {
    document.getElementsByClassName("mc")[i].style.display = "none";

    if(document.getElementsByClassName("tf")[i] != undefined) {
      document.getElementsByClassName("tf")[i].style.display = "none";
    }

    if(document.getElementsByClassName("matching")[i] != undefined) {
      document.getElementsByClassName("matching")[i].style.display = "none";
    }

    document.getElementById(i + 1).appendChild(createFreeResponse());
  }
  else if(val == "tf") {
    document.getElementsByClassName("mc")[i].style.display = "none";

    if(document.getElementsByClassName("fr")[i] != undefined) {
      document.getElementsByClassName("fr")[i].style.display = "none";
    }

    if(document.getElementsByClassName("matching")[i] != undefined) {
      document.getElementsByClassName("matching")[i].style.display = "none";
    }

    document.getElementById(i + 1).appendChild(createTrueFalse());
  }
  else if(val == "matching") {
    document.getElementsByClassName("mc")[i].style.display = "none";

    if(document.getElementsByClassName("fr")[i] != undefined) {
      document.getElementsByClassName("fr")[i].style.display = "none";
    }

    if(document.getElementsByClassName("tf")[i] != undefined) {
      document.getElementsByClassName("tf")[i].style.display = "none";
    }

    document.getElementById(i + 1).appendChild(createMatching());
  }
}


// True | False
function createTrueFalse() {
  var label = document.createElement('label');
  label.id = "label";

  var true_input = document.createElement('input');
  true_input.style.outline = "none";
  true_input.type = "radio";
  true_input.className = "option-input radio";
  true_input.name = "radio";

  var false_input = document.createElement('input');
  false_input.style.outline = "none";
  false_input.type = "radio";
  false_input.className = "option-input radio";
  false_input.name = "radio";
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
  ta.className = "fr";
  ta.placeholder = "NOTE: This question requires manual grading";

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

  var question_title = document.createElement('input');
  question_title.readOnly = true;
  question_title.type = "text";
  question_title.placeholder = "Ex: What's Your Name?";
  question_title.id = "question-title";

  question.appendChild(num);
  question.appendChild(question_title);

  var points = document.createElement('div');
  points.id = "points";
  var span = document.createElement('span');
  span.innerHTML = "( ";

  var numPoints = document.createElement('span');
  numPoints.type = "text";
  numPoints.id = "numPoints";
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
    input.name = "radio";

    var answer_choice = document.createElement('span');
    answer_choice.className = "option";
    answer_choice.id = "question-choice";

    label.appendChild(input);
    label.appendChild(answer_choice);
    answer_choices.appendChild(label);
  }
  question.appendChild(answer_choices);

  exam.appendChild(question);
  exam.appendChild(document.createElement('br'));
  exam.appendChild(hr);


  if(!loading) {
    window.scroll({ top: question.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    createQuestionTracker(document.getElementsByClassName('question').length, false);
  }
}

function createQuestionTracker(i, populating) {
  if(i == 2 && !populating) {
    createQuestionTracker(1, false);
  }
  var manager = document.getElementById('questionNums');

  var tracker = document.createElement('span');
  tracker.innerHTML = "&#x25CC;"
  tracker.style.fontSize = "60px";
  tracker.style.position = "relative";
  tracker.style.bottom = "20px";
  tracker.style.color = "#58f";
  tracker.style.left = "125px"

  tracker.id = "question-tracker";
  tracker.className = i;
  console.log(tracker, manager.childNodes[0]);

  $(tracker).hover(function(){
    var text = tracker.childNodes[1];

    this.style.cursor = "pointer";
    this.innerHTML = "&#x25CF;";
    this.appendChild(text);

    this.style.bottom = '25px';
    this.style.transition = 'all .5s';

    tracker.childNodes[1].style.color = "white";
  }, function(){
    var text = tracker.childNodes[1];
    this.innerHTML = "&#x25CC;";

    this.style.bottom = '20px';
    this.style.transition = 'all .5s';

    this.appendChild(text);
    tracker.childNodes[1].style.color = "black";
  });

  tracker.onclick = function() {
    document.getElementById(i).scrollIntoView({block: "center"});
  }

  var center = document.createElement('center');
  var text = document.createElement('div');
  text.id = "text";
  text.innerHTML = i;

  tracker.appendChild(text);

  manager.appendChild(tracker);
  manager.scrollTop = (manager.clientHeight + manager.clientHeight);
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

// submit code - reroute!
function submitExam() {
  console.log('submitted');
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
