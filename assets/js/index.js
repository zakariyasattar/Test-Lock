var examCodes = [], students = [], done = [];
var stopEnter = false, canCount = false, canChangeCircle = true;
var key = initKey(); var timer = 0; var originalOrder = [];

(function() {
    // Expose to global
    var leaverCount = 0;

    //code to call when document leaves full screen
    document.onfullscreenchange = function ( event ) {
      if(document.fullscreenElement == null) {
        let timerInterval;
        if(leaverCount <= 5) {
            Swal.fire({
              title: 'Are You Sure You Want To Leave?',
              html: 'You have <strong></strong> seconds to go back to your test or the test ends and your score is recorded! You can open this dialog <span></span> more times',
              confirmButtonText: 'Yes, end it!',
              cancelButtonText: 'No, Go Back!',
              showCancelButton: true,
              showConfirmButton: true,
              allowEscapeKey: false,
              allowEnterKey: false,
              timer: 10000,
              onBeforeOpen: () => {
                timerInterval = setInterval(() => {
                  Swal.getContent().querySelector('strong').textContent = Swal.getTimerLeft() / 1000;
                }, 100)
                Swal.getContent().querySelector('span').textContent = 4 - leaverCount;
              },
              onClose: () => {
                clearInterval(timerInterval)
              }
              }).then((result) => {
                if (!result.value) {
                  toggleFullScreen();

                  leaverCount++;
                }
                else if(result.value) {
                  endTest();
                }
                if (result.dismiss === Swal.DismissReason.timer) {
                  endTest();
                }
            });
          }
          else{
            endTest();
          }
      };
    }

})();

function createTeacher(name, classes) {
  for(var i = 0; i < classes.length; i++) {
    firebase.database().ref("Teachers/" + name + "/Classes/" + classes[i] + "/Exams/").push('no_exams');
    firebase.database().ref("Teachers/" + name + "/Classes/" + classes[i] + "/Students/").push('68742;Zakariya Sattar');
  }
}

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
//         // firebase.database().ref("Teachers/Zakariya Sattar/Classes/" + className + "/Students").push(id + ";" + name);
//
//         var json = {
//           answers: ["0:" + Math.floor(1 + Math.random()*(3)), "1:" + Math.floor(0 + Math.random()*(2))],
//           name: name,
//           score: Math.floor((Math.random() * 25) + 75),
//           time: 5,
//           totalScore: Math.floor((Math.random() * 5) + 15)
//         }
//
//         firebase.database().ref("Teachers/Zakariya Sattar/Classes/Advance App Development/Exams/YSDIMI/responses/" + name).push(json);
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
    localStorage.removeItem('userInfo');
  });
}

// for displayQuiz()
window.onload = function() {
  $("#create-exam").on('change', "input:radio", function() {
    if(!isNaN(parseInt(this.parentNode.parentNode.parentNode.id) - 1)) {  //MC
      done[parseInt(this.parentNode.parentNode.parentNode.id) - 1] = 1;
    }
    else {  //
      done[parseInt(this.parentNode.parentNode.id) - 1] = 1;
    }

    if(done.indexOf(0) == -1) {
      document.getElementById('submit-exam').style.display = 'initial';
      document.getElementById('submit-exam-disabled').style.display = "none";
    }
  });

  setTimeout(function(){ document.getElementById('timeLeftInExam').innerHTML = sessionStorage.getItem("timeLimit") + " minutes";  }, 5000);

  setInterval(function(){
    if(canCount) {
      if(timer == (sessionStorage.getItem("timeLimit") - 5)) {
        swal("Timer Warning", "5 minutes remaining in this exam", "info");
      }
      if(timer <= sessionStorage.getItem("timeLimit")) {
        timer++;
        document.getElementById('timeLeftInExam').innerHTML = sessionStorage.getItem("timeLimit") - timer + " minutes";
      }
      else { // if timer runs out
        window.location.reload();
      }
    }
  }, 60000);

  setInterval(function(){
    var today = new Date();
    var ampm = today.getHours() >= 12 ? 'pm' : 'am';
    var timeStamp = (today.getHours() % 12 || 12) + ":" + today.getMinutes() + ":" + today.getSeconds() + " " + ampm.toUpperCase();

    if(today.getSeconds() < 10) {
      var split = timeStamp.split(":");
      split[2] = "0" + split[2];
      timeStamp = split.join().replace(/,/g, ":");
    }

    if(today.getMinutes() < 10) {
      var split = timeStamp.split(":");
      split[1] = "0" + split[1];
      timeStamp = split.join().replace(/,/g, ":");
    }

    document.getElementById("currTime").innerHTML = timeStamp;

  }, 1000)

  $(window).scroll(function(){
    for(var i = 1; i <= document.getElementsByClassName('question').length; i++) {
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
          if(document.getElementsByClassName(i)[0] != undefined) {
            document.getElementsByClassName(i)[0].style.bottom = '20px';
            document.getElementsByClassName(i)[0].style.transition = 'all .5s';
          }
        }, 3000);

      }
      else {
        if(canChangeCircle) {
          document.getElementsByClassName(i)[0].style.bottom = '20px';
          document.getElementsByClassName(i)[0].style.transition = 'all .5s';

          var text = document.getElementsByClassName(i)[0].childNodes[1];
          document.getElementsByClassName(i)[0].innerHTML = "&#x25CC;"
          document.getElementsByClassName(i)[0].appendChild(text);
          document.getElementsByClassName(i)[0].childNodes[1].style.color = "black";
          document.getElementsByClassName(i)[0].childNodes[1].style.right = "22.5px";
        }
      }
    }
  });
};

function submitFeedbackForm() {
  var text = document.getElementById('form-text').value;

  var teacher = sessionStorage.getItem('teacher');
  var className = sessionStorage.getItem('className');
  var examCode = sessionStorage.getItem('ExamCode');

  firebase.database().ref("Teachers/" + teacher + "/Classes/" + className + "/Exams/" + examCode + "/feedback").push(text);

  swal("Thanks!", "Your response has been recorded!", 'success');
  document.getElementById('form-text').value = "";
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

document.getElementById("nav-toggle").onclick = function() {
  if(document.getElementById('nav-menu').style.display == "initial"){
    document.getElementById('nav-menu').style.display = "none";
  }
  else {
    document.getElementById('nav-menu').style.display = "initial";
  }
}

// remove dropdown if screen size can handle navbar
function removeDropDown(x) {
 if (x.matches) { // If media query matches
   document.getElementById('dropdown').style.display = "none";

   for(var i = 0; i < document.getElementsByClassName('navB').length; i++) {
     document.getElementsByClassName('navB')[i].style.display = "initial";
   }
 }
 else {
   document.getElementById('dropdown').style.display = "initial";
   for(var i = 0; i < document.getElementsByClassName('navB').length; i++) {
     document.getElementsByClassName('navB')[i].style.display = "none";
   }
 }
}

var x = window.matchMedia("(min-width: 730px)")
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
  document.getElementById('nav-menu').style.display = "none";
}

// search LB
function searchLeaderboard() {
  var input, filter, ul, tr, a, i, txtValue;

  input = document.getElementById("lb-search");
  tr = document.getElementById('leaderboard').getElementsByClassName("name");

  for (i = 0; i < tr.length; i++) {
    if(tr[i].innerHTML == input.value) {
      tr[i].style.border = "1px solid black";
      tr[i].scrollIntoView({behavior: "smooth"});
    }
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

  if(code.length == 5 && (!/[~!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(code)) ) {
    document.getElementById('exam-info').innerHTML = "";
    if(data == null) {
      swal("Invalid exam code!", "Check for special characters and make sure the length is at least 5", "error");
    }

    else if(data.split(";")[0] == code) {
      sessionStorage.setItem("teacher", data.split(";")[1]);
      document.getElementById('exam-info').innerHTML = data.split(";")[3] + " | " + data.split(";")[2];
      document.getElementById('id-input').style.display = 'initial';

      getCodeLetter(code, data.split(";")[1], data.split(";")[2])
      stopEnter = true;
    }
  }
}

function getCodeLetter(code, teacher, className) {
  firebase.database().ref("Teachers/" + teacher + "/Classes/" + className).once('value', function(snapshot) {
    for(exam in snapshot.val().Exams) {
      console.log(exam)
      if(exam.substring(1) == code) {
        sessionStorage.setItem('ExamCode', exam);
      }
    }
  });
}

function retrieveName() {
  var taken = false;
  var id = document.getElementsByClassName("ID")[0].value;

  if(id.length == 5){
    var i = 0;
    for(var x = 0; x < examCodes.length; x++){
      var decryptedBytes = CryptoJS.AES.decrypt(examCodes[x], key);
      var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if(plaintext.split(";")[0] == sessionStorage.getItem('ExamCode').substring(1)){
        i = x;
        break;
      }
    }

    var teacher = CryptoJS.AES.decrypt(examCodes[i], key);
    var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    document.getElementById('userName').innerHTML = "";

    firebase.database().ref("Teachers/" + plaintext.split(";")[1] + "/Classes/" + plaintext.split(";")[2] + "/Exams/" + sessionStorage.getItem("ExamCode") + "/taken").once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.val() == id) {
          taken = true;
        }
      });

      if(!taken || taken) {
        document.getElementById('userName').style.color = "black";
        sessionStorage.setItem('idNum', id);
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

      else {
        document.getElementById('userName').innerHTML = "You Have Taken This Exam Already!";
        document.getElementById('userName').style.color = "red";
      }
    });
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
  var code = sessionStorage.getItem("ExamCode");
  var teacher = sessionStorage.getItem("teacher");

  sessionStorage.setItem("StudentName", document.getElementById('userName').innerHTML);
  var i = 0;

  for(var x = 0; x < examCodes.length; x++){
    var decryptedBytes = CryptoJS.AES.decrypt(examCodes[x], key);
    var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);
    if(plaintext.split(";")[0] == code.substring(1) && plaintext.split(";")[1] == teacher){
      i = x;
      break;
    }
  }

  var teacher = CryptoJS.AES.decrypt(examCodes[i], key);
  var plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

  sessionStorage.setItem("className", plaintext.split(";")[2]);

  document.getElementById('main').style.display = "none";
  document.getElementById('navigation').style.display = "none";
  document.getElementById('display-exam').style.display = "initial";

  document.body.style.background = "white";
  document.body.style.overflow = "scroll";
  populateExam(code, firebase.database().ref("Teachers/" + plaintext.split(";")[1] + "/Classes/" + plaintext.split(";")[2] + "/Exams/" + code));
  toggleFullScreen();


  // listen for alt+tab changes and act upon them
  window.onblur = function() {
    toggleFullScreen();
  }

  canCount = true;

  firebase.database().ref("Teachers/" + sessionStorage.getItem('teacher') + "/Classes/" + sessionStorage.getItem('className') + "/Exams/" + sessionStorage.getItem("ExamCode")).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val().examCode != undefined) {
        sessionStorage.setItem("timeLimit", childSnapshot.val().examTotalMins);
      }
    });
  });

  firebase.database().ref("Teachers/" + sessionStorage.getItem('teacher') + "/Classes/" + sessionStorage.getItem('className') + "/Exams/" + sessionStorage.getItem("ExamCode") + "/taken").push(sessionStorage.getItem('idNum'));
}

//pull and populate exam
function populateExam(code, ref) {
  firebase.database().ref(ref).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var val = childSnapshot.val();

      if(val.examCode != undefined){
        var counter = 0;

        document.getElementById('exam-code').innerHTML = val.examCode + " | " + sessionStorage.getItem("StudentName");

        if(val.examDate.split("-")[1] != null) {
          document.getElementById('date').innerHTML = val.examTeacher + " | " + val.examDate.split("-")[1] + "-" + val.examDate.split("-")[2] + "-" + val.examDate.split("-")[0];
        }
        else {
          var dateJS = new Date();
          document.getElementById('date').innerHTML = val.examTeacher + " | " + (dateJS.getMonth()+1)+'-'+dateJS.getDate()+'-'+dateJS.getFullYear();
        }

        document.getElementById('description').value = val.examDescription;

        var title = val.examTitle;
        if(title == "") {
          title = "Untitled";
        }
        document.getElementById('nameOfExam').innerHTML = title;

        document.getElementsByClassName('points')[0].innerHTML = val.examTotalPoints;
        document.getElementsByClassName('time')[0].innerHTML = val.examTotalMins;

        $(document.getElementById('finalDiv')).empty();

        for(var i = 0; i < Object.keys(val.questions).length; i++) {
          done.push(0);

          var localQuestions = document.getElementsByClassName('question');
          var question = childSnapshot.val().questions[i];

          createQuestion(true, Object.keys(question.choices).length);
          createQuestionTracker(i + 1, true);

          localQuestions[i].childNodes[1].value = question.title;
          localQuestions[i].childNodes[2].childNodes[1].innerHTML = question.points;

          if(question.imgSrc != "") {
            var src = question.imgSrc;
            localQuestions[i].childNodes[2].childNodes[3].style.display = "initial";
            localQuestions[i].childNodes[2].childNodes[3].onclick = function() {
              swal({
                icon: src,
                text: question.imgShortDescription,
                className: "imgView"
              });
            }
          }

          changeQuestionType(question.type, i);

          if(question.type == "mc") {
            var multiple = question.multiple == "true";
            for(var j = 0; j < Object.keys(question.choices).length; j++){
              if(question.choices[j].value != undefined){
                localQuestions[i].childNodes[3].childNodes[j].childNodes[1].innerHTML = (question.choices[j].value);
              }
              else {
                localQuestions[i].childNodes[3].childNodes[j].childNodes[1].innerHTML = (question.choices[j]);
              }
            }

            if(question.multiple == "true") {
              changeNames(localQuestions[i]);

              var span = document.createElement('span');
              span.style.fontSize = "13px";
              span.style.paddingLeft = "20px";
              span.innerHTML = "You may select more than one answer for this question";

              localQuestions[i].childNodes[2].appendChild(span)
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
   setTimeout(function(){
     var questions = (document.getElementsByClassName('question'));
     var exam = document.getElementById('exam');

     //convert HTMLcollection to array and shuffle
     originalOrder = questions;
     var questionsArr = shuffle(Array.prototype.slice.call( questions ));

     $('.questionBr').remove(); $('.questionHr').remove(); $('.question').remove();

     for(var m = 0; m < questionsArr.length; m++) {
       exam.appendChild(questionsArr[m]);
       exam.appendChild(document.createElement('br'));
       exam.appendChild(document.createElement('hr'));
     }
     restructureQuestions();
   }, 500);
}

function changeNames(question) {
  var choices = question.childNodes[3].childNodes;

  for(var i = 0; i < choices.length; i++) {
    choices[i].childNodes[0].name = i;
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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
  label.className = "tf";

  var true_input = document.createElement('input');
  true_input.style.outline = "none";
  true_input.type = "radio";
  true_input.className = "option-input radio";
  true_input.name = "tf_radio"

  var false_input = document.createElement('input');
  false_input.style.outline = "none";
  false_input.type = "radio";
  false_input.className = "option-input radio";
  false_input.style.marginLeft = "10%";
  false_input.name = "tf_radio"

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

  // read when user changes text area
  ta.oninput = function() {
    setTimeout(function(){
      done[parseInt(ta.parentNode.id) - 1] = 1;

      if(done.indexOf(0) == -1) {
        document.getElementById('submit-exam').style.display = 'initial';
        document.getElementById('submit-exam-disabled').style.display = "none";
      }
    }, 350)
  }

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
  question.dataset.original = document.getElementsByClassName('question').length + 1;

  var num = document.createElement('span');
  num.innerHTML = document.getElementsByClassName('question').length + 1 + ". ";
  num.style.color = "#97a5aa";

  var hr = document.createElement('hr');
  hr.className = "questionHr";

  var br = document.createElement('br');
  br.className = "questionBr";

  var question_title = document.createElement('input');
  question_title.readOnly = true;
  question_title.type = "text";
  question_title.placeholder = "Ex: What's Your Name?";
  question_title.id = "question-title";

  question.appendChild(num);
  question.appendChild(question_title);

  var viewImage = document.createElement("a");
  viewImage.innerHTML = "View Image";
  viewImage.style.marginLeft = "10px";
  viewImage.style.display = "none";

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
  points.appendChild(viewImage);

  question.appendChild(points);

  var answer_choices = document.createElement('div');
  answer_choices.className = "mc";

  for(var i = 0; i < numAnswerChoices; i++) {
    var label = document.createElement('label');
    label.id = "label";

    var input = document.createElement('input');
    input.style.outline = "none";
    input.type = "radio";
    input.name = "group";
    input.className = "option-input radio";
    input.name = num.innerHTML;

    var answer_choice = document.createElement('span');
    answer_choice.className = "option";
    answer_choice.id = "question-choice";

    label.appendChild(input);
    label.appendChild(answer_choice);

    label.onmouseup = function() {
      if(this.childNodes[0].checked) {
        var button = this.childNodes[0];
        setTimeout(function(){ button.checked = false; }, 150);
      }
    }

    answer_choices.appendChild(label);
  }
  question.appendChild(answer_choices);

  exam.appendChild(question);
  exam.appendChild(br);
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
  var finalDiv = document.getElementById('finalDiv');

  var tracker = document.createElement('span');
  tracker.innerHTML = "&#x25CC;"
  tracker.style.fontSize = "60px";
  tracker.style.position = "relative";
  tracker.style.bottom = "20px";
  tracker.style.color = "#58f";
  tracker.style.left = "125px";

  tracker.id = "question-tracker";
  tracker.className = i;

  $(tracker).hover(function(){
    var text = tracker.childNodes[1];

    if(navigator.userAgent.toLowerCase().indexOf('safari/') > -1 || /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
      text.style.right = "22.5px";
    }

    this.style.cursor = "pointer";
    this.innerHTML = "&#x25CF;";
    this.appendChild(text);

    this.style.bottom = '25px';
    this.style.transition = 'all .5s';

    tracker.childNodes[1].style.color = "white";
  }, function(){
    var text = tracker.childNodes[1];
    this.innerHTML = "&#x25CC;";

    if(navigator.userAgent.toLowerCase().indexOf('safari/') > -1 || /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
      text.style.right = "27.5px";
    }

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

  if(navigator.userAgent.toLowerCase().indexOf('safari/') > -1 || /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
    text.style.right = "27.5px";
  }

  tracker.appendChild(text);

  finalDiv.appendChild(tracker);
  manager.appendChild(finalDiv);
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

function getChecked(question) {
  var type = question.childNodes[Object.keys(question.childNodes)[question.childNodes.length - 1]];
  var checked = [];

  if(type.className == "mc") {
    for(var i = 0; i < type.childNodes.length; i++) {
      if(type.childNodes[i].childNodes[0].checked == true) {
        checked.push(i);
      }
    }
    return checked;
  }

  else if(type.className == "tf") {
    if(type.childNodes[0].checked) {
      return 0;
    }
    else {
      return 1;
    }
  }

  else if(type.className == "matching"){
    type = "matching";
    return 15;
  }

  else if(type.className == "fr"){
    return type.value;
  }
}

function bubbleSort(array) {
  for(var i = 0; i < array.length; i++) {
    for(var j = 1; j < array.length; j++) {
      if(array[j - 1].dataset.original > array[j].dataset.original) {
        var temp = array[j-1];
        array[j-1] = array[j];
        array[j] = temp;
      }
    }
  }
  return array;
}

// submit code - reroute!
function submitExam() {
  var student_answers = [];
  var sortedArray = bubbleSort(Array.prototype.slice.call( originalOrder ));

  for(var i = 0; i < sortedArray.length; i++) {
    var question = sortedArray[i];
    var checked = getChecked(question);

    student_answers.push(i + ";" + checked);
  }

  sessionStorage.setItem("student_answers", JSON.stringify(student_answers));

  document.getElementById('display-exam').style.display = "none";
  document.getElementById('result').style.display = "initial";

  displayResults();
}

// function to display results
function displayResults() {
  var answers = JSON.parse(sessionStorage.getItem('student_answers'));
  var dbAnswers;
  var responseStructure = {};

  firebase.database().ref("Teachers/" + sessionStorage.getItem('teacher') + "/Classes/" + sessionStorage.getItem('className') + "/Exams/" + sessionStorage.getItem("ExamCode")).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.toJSON().questions != undefined) {
        dbAnswers = childSnapshot.toJSON();
      }
    });

    var total = 0;
    var frTotalPoints = 0;

    for(var i = 0; i < originalOrder.length; i++) {
      var answer = "";
      var fr = false;
      var tf = false;

      if(dbAnswers.questions[i].type == "tf") {
        tf = true;
        if(answers[i].split(";")[1] == 1) {
          answer = "false";
        }
        else {
          answer = "true";
        }

        if(answer == dbAnswers.questions[i].choices[0]){
          total += parseInt(dbAnswers.questions[i].points);
          createCorrectBox(dbAnswers.questions[i].title, answers[i].split(";")[0], parseInt(dbAnswers.questions[i].points));
        }
        else {
          createIncorrectBox(dbAnswers.questions[i].title, answers[i].split(";")[0], parseInt(dbAnswers.questions[i].points));
        }
      }

      else if(dbAnswers.questions[i].type == "mc") {
        if(answers[i].indexOf(',') == -1) {
          answer = parseInt(answers[i].split(";")[1])
        }
        else {
          answer = answers[i].split(";")[1];
        }
      }

      else {
        fr = true;
        createFrBox(dbAnswers.questions[i].title, answers[i].split(";")[0], parseInt(dbAnswers.questions[i].points));
        frTotalPoints += parseInt(dbAnswers.questions[i].points);
      }

      if(!fr && !tf) {
        if(typeof answer == 'string' && answer.indexOf(',') != -1) {
          for(var k = 0; k < Object.keys(dbAnswers.questions[i].checked).length; k++) {
            for(var s = 0; s < answer.split(",").length; s++) {
              if(dbAnswers.questions[i].checked[k] == parseInt(answer.split(",")[s])){
                total += parseInt(dbAnswers.questions[i].points) / answer.split(",").length;
              }
            }
          }
          if(total == parseInt(dbAnswers.questions[i].points)) {
            createCorrectBox(dbAnswers.questions[i].title, answers[i].split(";")[0], total);
          }
          else {
            createPartialBox(dbAnswers.questions[i].title, answers[i].split(";")[0], total, parseInt(dbAnswers.questions[i].points));
          }
        }
        else {
          if(answer == dbAnswers.questions[i].checked) {
            total += parseInt(dbAnswers.questions[i].points);
            createCorrectBox(dbAnswers.questions[i].title, answers[i].split(";")[0], parseInt(dbAnswers.questions[i].points));
          }
          else {
            createIncorrectBox(dbAnswers.questions[i].title, answers[i].split(";")[0], parseInt(dbAnswers.questions[i].points));
          }
        }
      }
    }

    var studentExamData = {
      "score" : ((total / (dbAnswers.examTotalPoints - frTotalPoints)) * 100).toFixed(1),
      "time" : timer,
      "answers" : answers,
      "name" : sessionStorage.getItem('StudentName'),
      "totalScore" : (total / (dbAnswers.examTotalPoints) * 100).toFixed(1)
    }

    firebase.database().ref("Teachers/" + sessionStorage.getItem('teacher') + "/Classes/" + sessionStorage.getItem('className') + "/Exams/" + sessionStorage.getItem("ExamCode") + "/responses/" + sessionStorage.getItem('StudentName')).push(studentExamData);

    var min = " Minutes"

    if(timer == 1) {
      min = " Minute"
    }

    document.getElementById('score').innerHTML = studentExamData.score + "%";
    document.getElementById('score-num').innerHTML = (total + " / " + (dbAnswers.examTotalPoints - frTotalPoints) + " in " + timer + min);

  });


   var result = document.getElementById('result');
}

function createFrBox(title, num, points) {
  var dataDiv = document.getElementById('question-data');

  var box = document.createElement('div');
  box.style.width = "90vw";
  box.style.marginTop = "10px";
  box.style.border = "1px solid black";
  box.style.padding = "15px";
  box.style.height = "50px";
  box.style.background = "#798893";
  box.style.color = "white";
  box.style.borderRadius = "6px";
  box.className = "questionBox";

  var name = document.createElement('span');
  name.innerHTML = parseInt(num) + 1 + " | " + title;
  name.style.float = "left";
  name.style.paddingLeft = "10px";

  var pointsAwarded = document.createElement('span');
  pointsAwarded.innerHTML = "Free Response Questions Require Manual Grading (Points Possible: " + points + ")"
  pointsAwarded.style.float = "right";
  pointsAwarded.style.paddingRight = "20px";

  box.appendChild(name);
  box.appendChild(pointsAwarded);

  dataDiv.appendChild(box);
}

function createPartialBox(title, num, points, totalPoints) {
  var dataDiv = document.getElementById('question-data');

  var box = document.createElement('div');
  box.style.width = "90vw";
  box.style.marginTop = "10px";
  box.style.border = "1px solid black";
  box.style.padding = "15px";
  box.style.height = "50px";
  box.style.background = "#eac07c";
  box.style.borderRadius = "6px";
  box.className = "questionBox";

  var name = document.createElement('span');
  name.innerHTML = parseInt(num) + 1 + " | " + title;
  name.style.float = "left";
  name.style.paddingLeft = "10px";

  var pointsAwarded = document.createElement('span');
  pointsAwarded.innerHTML = "You Received " + points + " / " + totalPoints + " Points For This Question!"
  pointsAwarded.style.float = "right";
  pointsAwarded.style.paddingRight = "20px";

  box.appendChild(name);
  box.appendChild(pointsAwarded);

  dataDiv.appendChild(box);
}

function createCorrectBox(title, num, points) {
  var dataDiv = document.getElementById('question-data');

  var box = document.createElement('div');
  box.style.width = "90vw";
  box.style.marginTop = "10px";
  box.style.border = "1px solid black";
  box.style.padding = "15px";
  box.style.height = "50px";
  box.style.background = "#84f277";
  box.style.borderRadius = "6px";
  box.className = "questionBox";

  var name = document.createElement('span');
  name.innerHTML = parseInt(num) + 1 + " | " + title;
  name.style.float = "left";
  name.style.paddingLeft = "10px";

  var pointsAwarded = document.createElement('span');
  pointsAwarded.innerHTML = "You Received " + points + " / " + points + " Points For This Question!"
  pointsAwarded.style.float = "right";
  pointsAwarded.style.paddingRight = "20px";

  box.appendChild(name);
  box.appendChild(pointsAwarded);

  dataDiv.appendChild(box);
}

function createIncorrectBox(title, num, points) {
  var dataDiv = document.getElementById('question-data');

  var box = document.createElement('div');
  box.style.width = "90vw";
  box.style.marginTop = "10px";
  box.style.border = "1px solid black";
  box.style.padding = "15px";
  box.style.height = "50px";
  box.style.background = "#cc2d2d";
  box.style.color = "white";
  box.style.borderRadius = "6px";
  box.className = "questionBox";

  var name = document.createElement('span');
  name.innerHTML = parseInt(num) + 1 + " | " + title;
  name.style.float = "left";
  name.style.paddingLeft = "10px";

  var pointsAwarded = document.createElement('span');
  pointsAwarded.innerHTML = "You Received " + 0 + " / " + points + " Points For This Question"
  pointsAwarded.style.float = "right";
  pointsAwarded.style.paddingRight = "20px";

  box.appendChild(name);
  box.appendChild(pointsAwarded);

  dataDiv.appendChild(box);
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
