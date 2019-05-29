// // check if user is signed in
// if(localStorage.getItem('userInfo') == null) {
//   document.getElementById('body').style.display = "none";
//   alert("NOT AUTHORIZED");
// }
//

// Pull all exam codes and seperate the datapoint from each other
var examCodes = [];
var examCodesTeachers = [];
var arr = [];

window.onload = function() {
  populateDashboard();
};

firebase.database().ref('exam-codes').on('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    examCodes.push(childSnapshot.val().split(";")[0]);
    examCodesTeachers.push(childSnapshot.val().split(";")[1])
  });
});


var userName = (JSON.parse(localStorage.getItem("userInfo"))[1]);

function createQuiz() {
  var randomCode = generateCode();

  if(examCodes.indexOf(randomCode) == -1){
    firebase.database().ref("exam-codes").push(randomCode.toUpperCase() + ";" + userName); //+ ";" + object.innerHTML);
  }
  else {
    createQuiz();
  }
}

function generateCode() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

// create div box for every class
function createClassBox(className, size) {
  var wrapper = document.getElementById('wrapper');
  wrapper.style = "grid-template-columns: repeat(" + size + ", 1fr)";

  var classBox = document.createElement('div');
  classBox.innerHTML = className;

  wrapper.appendChild(classBox);

  document.body.appendChild(wrapper);
}

function populateDashboard() {
  var ref = firebase.database().ref('Teachers');
  var counter = 0;

  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.key == userName) {
        arr.push(childSnapshot.child("Classes").val());

        for (var key in arr) {
          // skip loop if the property is from prototype
          if (!arr.hasOwnProperty(key)) continue;
          var obj = arr[key];
          for (var prop in obj) {

            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }

              // skip loop if the property is from prototype
              if(!obj.hasOwnProperty(prop)) continue;

              // your code
              createClassBox(prop, size);
          }
        }
      }
    });
  });

}
