parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"NvjX":[function(require,module,exports) {
var e=[],t=[],n=[],s=!1,a=!1,o=!0,l=u(),i=0,d=[];function r(e){if(-1==document.URL.indexOf("?")){window.location="teacher.html";var t=e.getBasicProfile();sessionStorage.setItem("userInfo",JSON.stringify([t.getId(),t.getName(),t.getImageUrl(),t.getEmail()]))}else window.location.href=document.URL.substring(0,document.URL.indexOf("?")),sessionStorage.setItem("userInfo",""),m()}function m(){gapi.auth2.getAuthInstance().signOut().then(function(){sessionStorage.removeItem("userInfo")})}function c(){var e=document.getElementById("form-text").value,t=sessionStorage.getItem("teacher"),n=sessionStorage.getItem("className"),s=sessionStorage.getItem("ExamCode");firebase.database().ref("Teachers/"+t+"/Classes/"+n+"/Exams/"+s+"/feedback").push(e),swal("Thanks!","Your response has been recorded!","success"),document.getElementById("form-text").value=""}function u(){var e,t,n=[];for(t=0;t<25;t++)n[t]=t+1;n.sort(function(){return Math.random()-.25});for(var s=0;s<n.length;s++)e=n[s]+e+"";return e.replace("NaN","")}function p(){document.getElementsByTagName("LI")[0].className="",document.getElementsByTagName("LI")[1].className="",document.getElementsByTagName("LI")[2].className=""}function g(e){if(e.matches){document.getElementById("dropdown").style.display="none";for(var t=0;t<document.getElementsByClassName("navB").length;t++)document.getElementsByClassName("navB")[t].style.display="initial"}else{document.getElementById("dropdown").style.display="initial";for(t=0;t<document.getElementsByClassName("navB").length;t++)document.getElementsByClassName("navB")[t].style.display="none"}}!function(){var e=0;document.onfullscreenchange=function(t){var n;null==document.fullscreenElement&&(e<=5?Swal.fire({title:"Are You Sure You Want To Leave?",html:"You have <strong></strong> seconds to go back to your test or the test ends and your score is recorded! You can open this dialog <span></span> more times",confirmButtonText:"Yes, end it!",cancelButtonText:"No, Go Back!",showCancelButton:!0,showConfirmButton:!0,allowEscapeKey:!1,allowEnterKey:!1,timer:1e4,onBeforeOpen:function(){n=setInterval(function(){Swal.getContent().querySelector("strong").textContent=Swal.getTimerLeft()/1e3},100),Swal.getContent().querySelector("span").textContent=4-e},onClose:function(){clearInterval(n)}}).then(function(t){t.value?t.value&&D():(J(),e++),t.dismiss===Swal.DismissReason.timer&&D()}):D())}}(),firebase.database().ref("exam-codes").on("value",function(t){t.forEach(function(t){var n=CryptoJS.AES.encrypt(t.val(),l);e.push(n)})}),firebase.database().ref("Students").on("value",function(e){e.forEach(function(e){t.push(e.val())})}),window.onload=function(){$("#create-exam").on("change","input:radio",function(){isNaN(parseInt(this.parentNode.parentNode.parentNode.id)-1)?n[parseInt(this.parentNode.parentNode.id)-1]=1:n[parseInt(this.parentNode.parentNode.parentNode.id)-1]=1,-1==n.indexOf(0)&&(document.getElementById("submit-exam").style.display="initial",document.getElementById("submit-exam-disabled").style.display="none")}),setTimeout(function(){document.getElementById("timeLeftInExam").innerHTML=sessionStorage.getItem("timeLimit")+" minutes"},1500),setInterval(function(){a&&(i==sessionStorage.getItem("timeLimit")-5&&swal("Timer Warning","5 minutes remaining in this exam","info"),i<=sessionStorage.getItem("timeLimit")?(i++,document.getElementById("timeLeftInExam").innerHTML=sessionStorage.getItem("timeLimit")-i+" minutes"):window.location.reload())},6e4),setInterval(function(){var e=new Date;e.getSeconds()<10?document.getElementById("currTime").innerHTML=(e.getHours()%12||12)+":"+e.getMinutes()+":0"+e.getSeconds():document.getElementById("currTime").innerHTML=(e.getHours()%12||12)+":"+e.getMinutes()+":"+e.getSeconds()},1e3),$(window).scroll(function(){for(var e=1;e<=document.getElementsByClassName("question").length;e++){var t=document.getElementById(e),n=$(window).scrollTop(),s=n+$(window).height(),a=$(t).offset().top;if(a+$(t).height()<=s&&a>=n){document.getElementsByClassName(e)[0].style.bottom="25px",document.getElementsByClassName(e)[0].style.transition="all .5s";var l=document.getElementsByClassName(e)[0].childNodes[1];document.getElementsByClassName(e)[0].innerHTML="&#x25CF;",document.getElementsByClassName(e)[0].appendChild(l),document.getElementsByClassName(e)[0].childNodes[1].style.color="white",document.getElementsByClassName(e)[0].childNodes[1].style.right="22.5px",setTimeout(function(){null!=document.getElementsByClassName(e)[0]&&(document.getElementsByClassName(e)[0].style.bottom="20px",document.getElementsByClassName(e)[0].style.transition="all .5s")},3e3)}else if(o){document.getElementsByClassName(e)[0].style.bottom="20px",document.getElementsByClassName(e)[0].style.transition="all .5s";l=document.getElementsByClassName(e)[0].childNodes[1];document.getElementsByClassName(e)[0].innerHTML="&#x25CC;",document.getElementsByClassName(e)[0].appendChild(l),document.getElementsByClassName(e)[0].childNodes[1].style.color="black",document.getElementsByClassName(e)[0].childNodes[1].style.right="22.5px"}}})},document.getElementById("nav-toggle").onclick=function(){"initial"==document.getElementById("nav-menu").style.display?document.getElementById("nav-menu").style.display="none":document.getElementById("nav-menu").style.display="initial"};var y=window.matchMedia("(min-width: 730px)");function h(e){'<a href="#">Ping-Pong</a>'==e?(document.getElementById("main").style.display="none",document.getElementById("pong").style.display="initial",document.getElementById("leaderboard").style.display="none"):'<a href="#">Home</a>'==e?(document.getElementById("main").style.display="initial",document.getElementById("pong").style.display="none",document.getElementById("leaderboard").style.display="none",document.body.style.background="#1b1b1d"):'<a href="#">Leaderboard</a>'==e&&(document.getElementById("main").style.display="none",document.getElementById("pong").style.display="none",document.getElementById("leaderboard").style.display="initial",document.body.style.background="white",populateLeaderboard()),document.getElementById("nav-menu").style.display="none"}function f(){var e,t,n;for(e=document.getElementById("lb-search"),t=document.getElementById("leaderboard").getElementsByClassName("name"),n=0;n<t.length;n++)t[n].innerHTML==e.value&&(t[n].style.border="1px solid black",t[n].scrollIntoView({behavior:"smooth"}))}function E(e){for(var n,s=0,a=(t=v(t)).length-1;s<=a;){if(n=Math.floor((s+a)/2),t[n].split(";")[0]==e)return t[n];t[n].split(";")[0]<e?s=n+1:a=n-1}return-1}function v(e){if(1===e.length)return e;var t=Math.floor(e.length/2),n=e.slice(0,t),s=e.slice(t);return N(v(n),v(s))}function N(e,t){for(var n=[],s=0,a=0;s<e.length&&a<t.length;)e[s].split(";")[0]<t[a].split(";")[0]?(n.push(e[s]),s++):(n.push(t[a]),a++);return n.concat(e.slice(s)).concat(t.slice(a))}function C(){var e=document.getElementById("inputExamCode").value.toUpperCase(),t=I(e);5!=e.length||/[~!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(e)||(document.getElementById("exam-info").innerHTML="",null==t?swal("Invalid exam code!","Check for special characters and make sure the length is at least 5","error"):t.split(";")[0]==e&&(sessionStorage.setItem("teacher",t.split(";")[1]),document.getElementById("exam-info").innerHTML=t.split(";")[3]+" | "+t.split(";")[2],document.getElementById("id-input").style.display="initial",x(e,t.split(";")[1],t.split(";")[2]),s=!0))}function x(e,t,n){firebase.database().ref("Teachers/"+t+"/Classes/"+n).once("value",function(t){for(exam in t.val().Exams)console.log(exam),exam.substring(1)==e&&sessionStorage.setItem("ExamCode",exam)})}function B(){var t=!1,n=document.getElementsByClassName("ID")[0].value;if(5==n.length){for(var s=0,a=0;a<e.length;a++){var o=CryptoJS.AES.decrypt(e[a],l);if((i=o.toString(CryptoJS.enc.Utf8)).split(";")[0]==sessionStorage.getItem("ExamCode").substring(1)){s=a;break}}CryptoJS.AES.decrypt(e[s],l);var i=o.toString(CryptoJS.enc.Utf8);document.getElementById("userName").innerHTML="",firebase.database().ref("Teachers/"+i.split(";")[1]+"/Classes/"+i.split(";")[2]+"/Exams/"+sessionStorage.getItem("ExamCode")+"/taken").once("value",function(e){e.forEach(function(e){e.val()==n&&(t=!0)}),!t||t?(document.getElementById("userName").style.color="black",sessionStorage.setItem("idNum",n),firebase.database().ref("Teachers/"+i.split(";")[1]+"/Classes/"+i.split(";")[2]+"/Students").once("value",function(e){e.forEach(function(e){e.val().split(";")[0]==n&&(document.getElementById("userName").innerHTML=e.val().split(";")[1],document.getElementById("proceed").style.display="initial",document.getElementById("recognition").style.bottom="-10px")})}),""==document.getElementById("userName").innerHTML&&(document.getElementById("userName").innerHTML="Not Found!")):(document.getElementById("userName").innerHTML="You Have Taken This Exam Already!",document.getElementById("userName").style.color="red")})}}function I(t){for(var n=0;n<e.length;n++){var s=CryptoJS.AES.decrypt(e[n],l).toString(CryptoJS.enc.Utf8);if(s.split(";")[0]==t)return s}return null}function b(){var t=sessionStorage.getItem("ExamCode"),n=sessionStorage.getItem("teacher");sessionStorage.setItem("StudentName",document.getElementById("userName").innerHTML);for(var s=0,o=0;o<e.length;o++){var i=CryptoJS.AES.decrypt(e[o],l);if((d=i.toString(CryptoJS.enc.Utf8)).split(";")[0]==t.substring(1)&&d.split(";")[1]==n){s=o;break}}n=CryptoJS.AES.decrypt(e[s],l);var d=i.toString(CryptoJS.enc.Utf8);sessionStorage.setItem("className",d.split(";")[2]),document.getElementById("main").style.display="none",document.getElementById("navigation").style.display="none",document.getElementById("display-exam").style.display="initial",document.body.style.background="white",document.body.style.overflow="scroll",T(t,firebase.database().ref("Teachers/"+d.split(";")[1]+"/Classes/"+d.split(";")[2]+"/Exams/"+t)),window.onblur=function(){J()},a=!0,firebase.database().ref("Teachers/"+sessionStorage.getItem("teacher")+"/Classes/"+sessionStorage.getItem("className")+"/Exams/"+sessionStorage.getItem("ExamCode")).once("value").then(function(e){e.forEach(function(e){null!=e.val().examCode&&sessionStorage.setItem("timeLimit",e.val().examTotalMins)})}),firebase.database().ref("Teachers/"+sessionStorage.getItem("teacher")+"/Classes/"+sessionStorage.getItem("className")+"/Exams/"+sessionStorage.getItem("ExamCode")+"/taken").push(sessionStorage.getItem("idNum"))}function T(e,t){firebase.database().ref(t).once("value").then(function(e){e.forEach(function(e){var t=e.val();if(null!=t.examCode){if(document.getElementById("exam-code").innerHTML=t.examCode+" | "+sessionStorage.getItem("StudentName"),null!=t.examDate.split("-")[1])document.getElementById("date").innerHTML=t.examTeacher+" | "+t.examDate.split("-")[1]+"-"+t.examDate.split("-")[2]+"-"+t.examDate.split("-")[0];else{var s=new Date;document.getElementById("date").innerHTML=t.examTeacher+" | "+(s.getMonth()+1)+"-"+s.getDate()+"-"+s.getFullYear()}document.getElementById("description").value=t.examDescription;var a=t.examTitle;""==a&&(a="Untitled"),document.getElementById("nameOfExam").innerHTML=a,document.getElementsByClassName("points")[0].innerHTML=t.examTotalPoints,document.getElementsByClassName("time")[0].innerHTML=t.examTotalMins,$(document.getElementById("finalDiv")).empty();for(var o=0;o<Object.keys(t.questions).length;o++){n.push(0);var l=document.getElementsByClassName("question"),i=e.val().questions[o];if(R(!0,Object.keys(i.choices).length),A(o+1,!0),l[o].childNodes[1].value=i.title,l[o].childNodes[2].childNodes[1].innerHTML=i.points,""!=i.imgSrc){var d=i.imgSrc;l[o].childNodes[2].childNodes[3].style.display="initial",l[o].childNodes[2].childNodes[3].onclick=function(){swal({icon:d,text:i.imgShortDescription,className:"imgView"})}}if(M(i.type,o),"mc"==i.type){i.multiple;for(var r=0;r<Object.keys(i.choices).length;r++)null!=i.choices[r].value?l[o].childNodes[3].childNodes[r].childNodes[1].innerHTML=i.choices[r].value:l[o].childNodes[3].childNodes[r].childNodes[1].innerHTML=i.choices[r];if("true"==i.multiple){S(l[o]);var m=document.createElement("span");m.style.fontSize="13px",m.style.paddingLeft="20px",m.innerHTML="You may select more than one answer for this question",l[o].childNodes[2].appendChild(m)}}else if("matching"==i.type){document.getElementsByClassName("matching")[o].childNodes[0].value=i.numBoxes;for(r=0;r<i.numBoxes;r++)O(document.getElementsByClassName("matching-wrapper")[o],r+1);for(var c=document.getElementsByClassName("matchingbox"),u=0;u<c.length;u++)c[u].childNodes[1].value=i.choices[u].split(";")[0],c[u].childNodes[3].value=i.choices[u].split(";")[1]}}}})}),setTimeout(function(){var e=document.getElementsByClassName("question"),t=document.getElementById("exam");d=e;var n=L(Array.prototype.slice.call(e));$(".questionBr").remove(),$(".questionHr").remove(),$(".question").remove();for(var s=0;s<n.length;s++)t.appendChild(n[s]),t.appendChild(document.createElement("br")),t.appendChild(document.createElement("hr"));w()},500)}function S(e){for(var t=e.childNodes[3].childNodes,n=0;n<t.length;n++)t[n].childNodes[0].name=n}function L(e){for(var t,n,s=e.length;0!==s;)n=Math.floor(Math.random()*s),t=e[s-=1],e[s]=e[n],e[n]=t;return e}function w(){for(var e=document.getElementsByClassName("question"),t=0;t<e.length;t++){var n=e[t];n.childNodes[0].innerHTML=t+1+". ",n.id=t+1}}function M(e,t){"mc"==e?(document.getElementsByClassName("mc")[t].style.display="initial",null!=document.getElementsByClassName("fr")[t]&&(document.getElementsByClassName("fr")[t].style.display="none"),null!=document.getElementsByClassName("tf")[t]&&(document.getElementsByClassName("tf")[t].style.display="none"),null!=document.getElementsByClassName("matching")[t]&&(document.getElementsByClassName("matching")[t].style.display="none")):"fr"==e?(document.getElementsByClassName("mc")[t].style.display="none",null!=document.getElementsByClassName("tf")[t]&&(document.getElementsByClassName("tf")[t].style.display="none"),null!=document.getElementsByClassName("matching")[t]&&(document.getElementsByClassName("matching")[t].style.display="none"),document.getElementById(t+1).appendChild(H())):"tf"==e?(document.getElementsByClassName("mc")[t].style.display="none",null!=document.getElementsByClassName("fr")[t]&&(document.getElementsByClassName("fr")[t].style.display="none"),null!=document.getElementsByClassName("matching")[t]&&(document.getElementsByClassName("matching")[t].style.display="none"),document.getElementById(t+1).appendChild(q())):"matching"==e&&(document.getElementsByClassName("mc")[t].style.display="none",null!=document.getElementsByClassName("fr")[t]&&(document.getElementsByClassName("fr")[t].style.display="none"),null!=document.getElementsByClassName("tf")[t]&&(document.getElementsByClassName("tf")[t].style.display="none"),document.getElementById(t+1).appendChild(k()))}function q(){var e=document.createElement("label");e.id="label",e.className="tf";var t=document.createElement("input");t.style.outline="none",t.type="radio",t.className="option-input radio",t.name="tf_radio";var n=document.createElement("input");n.style.outline="none",n.type="radio",n.className="option-input radio",n.style.marginLeft="10%",n.name="tf_radio";var s=document.createElement("span");s.innerHTML=" True",s.style.marginLeft="10px",s.style.color="gray",s.style.fontWeight="normal";var a=document.createElement("span");return a.innerHTML=" False",a.style.marginLeft="10px",a.style.color="gray",a.style.fontWeight="normal",e.appendChild(t),e.appendChild(s),e.appendChild(n),e.appendChild(a),e}function H(){var e=document.createElement("textarea");return e.oninput=function(){setTimeout(function(){n[parseInt(e.parentNode.id)-1]=1,-1==n.indexOf(0)&&(document.getElementById("submit-exam").style.display="initial",document.getElementById("submit-exam-disabled").style.display="none")},350)},e.className="fr",e.placeholder="NOTE: This question requires manual grading",e}function k(){var e=document.createElement("div");e.className="matching-wrapper";var t=document.createElement("div");t.className="matching";var n=document.createElement("hr");n.style.width="67%";var s=document.createElement("span");s.innerHTML="Questions",s.style.marginLeft="1.5vw";var a=document.createElement("span");a.innerHTML="Results (Will Be Randomized)",a.style.marginLeft="22.5vw";var o=document.createElement("input");o.type="textbox",o.placeholder="# Of Elements...",o.style.borderRadius="5px",o.style.padding="5px",o.style.border="1px solid black",o.style.fontSize="15px",o.onkeyup=function(){if($(e).empty(),this.value<=20)for(var t=0;t<this.value;t++)O(e,t+1);else{this.value="";var n=document.createElement("div");n.innerHTML="20 Elements Max!",n.style.textAlign="center",n.style.width="100%",n.style.position="fixed",n.style.zIndex="100000",n.style.top="0",n.className="alert alert-danger",n.role="alert",document.getElementById("create-exam").appendChild(document.createElement("center").appendChild(n)),setTimeout(function(){document.getElementsByClassName("alert")[0].remove()},2500)}};var l=document.createElement("button");return l.id="newBox",l.innerHTML="New Element!",l.onclick=function(){O(e,document.getElementsByClassName("matchingbox").length+1),saveExam(!1)},t.appendChild(o),t.appendChild(n),t.appendChild(s),t.appendChild(a),t.appendChild(e),t.appendChild(document.createElement("br")),t.appendChild(l),t}function O(e,t){var n=document.createElement("div");n.className="matchingbox";var s=document.createElement("span");s.className="glyphicon glyphicon-minus",s.style.display="none",s.style.marginRight="5px",s.style.color="#f25555",$(s).click(function(){this.parentNode.remove(),saveExam(!1),restructureBoxes()}),$(n).hover(function(){this.childNodes[0].style.display="initial"},function(){this.childNodes[0].style.display="none"}),$(s).hover(function(){this.style.cursor="pointer",this.style.color="#f25555"},function(){}),n.appendChild(s);var a=document.createElement("span");a.innerHTML=t+".",a.style.marginRight="10px",a.style.fontSize="15px",n.appendChild(a);var o=document.createElement("input");o.type="textbox",o.style.marginTop="20px",o.style.textAlign="center",o.placeholder="1 + 1",o.id="result";var l=document.createElement("span");l.className="glyphicon glyphicon-arrow-right",l.style.paddingLeft="5vw";var i=document.createElement("input");i.type="textbox",i.style.marginLeft="5vw",i.style.textAlign="center",i.placeholder="2",i.id="result",n.appendChild(o),n.appendChild(l),n.appendChild(i),e.appendChild(n)}function R(e,t){var n=document.getElementById("exam"),s=document.createElement("div");s.className="question",s.id=document.getElementsByClassName("question").length+1,s.dataset.original=document.getElementsByClassName("question").length+1;var a=document.createElement("span");a.innerHTML=document.getElementsByClassName("question").length+1+". ",a.style.color="#97a5aa";var o=document.createElement("hr");o.className="questionHr";var l=document.createElement("br");l.className="questionBr";var i=document.createElement("input");i.readOnly=!0,i.type="text",i.placeholder="Ex: What's Your Name?",i.id="question-title",s.appendChild(a),s.appendChild(i);var d=document.createElement("a");d.innerHTML="View Image",d.style.marginLeft="10px",d.style.display="none";var r=document.createElement("div");r.id="points";var m=document.createElement("span");m.innerHTML="( ";var c=document.createElement("span");c.type="text",c.id="numPoints",c.placeholder="Ex: 4";var u=document.createElement("span");u.innerHTML=" points)",r.appendChild(m),r.appendChild(c),r.appendChild(u),r.appendChild(d),s.appendChild(r);var p=document.createElement("div");p.className="mc";for(var g=0;g<t;g++){var y=document.createElement("label");y.id="label";var h=document.createElement("input");h.style.outline="none",h.type="radio",h.name="group",h.className="option-input radio",h.name=a.innerHTML;var f=document.createElement("span");f.className="option",f.id="question-choice",y.appendChild(h),y.appendChild(f),y.onmouseup=function(){if(this.childNodes[0].checked){var e=this.childNodes[0];setTimeout(function(){e.checked=!1},150)}},p.appendChild(y)}s.appendChild(p),n.appendChild(s),n.appendChild(l),n.appendChild(o),e||(window.scroll({top:s.getBoundingClientRect().top+window.scrollY,behavior:"smooth"}),A(document.getElementsByClassName("question").length,!1))}function A(e,t){2!=e||t||A(1,!1);var n=document.getElementById("questionNums"),s=document.getElementById("finalDiv"),a=document.createElement("span");a.innerHTML="&#x25CC;",a.style.fontSize="60px",a.style.position="relative",a.style.bottom="20px",a.style.color="#58f",a.style.left="125px",a.id="question-tracker",a.className=e,$(a).hover(function(){var e=a.childNodes[1];(navigator.userAgent.toLowerCase().indexOf("safari/")>-1||/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor))&&(e.style.right="22.5px"),this.style.cursor="pointer",this.innerHTML="&#x25CF;",this.appendChild(e),this.style.bottom="25px",this.style.transition="all .5s",a.childNodes[1].style.color="white"},function(){var e=a.childNodes[1];this.innerHTML="&#x25CC;",(navigator.userAgent.toLowerCase().indexOf("safari/")>-1||/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor))&&(e.style.right="27.5px"),this.style.bottom="20px",this.style.transition="all .5s",this.appendChild(e),a.childNodes[1].style.color="black"}),a.onclick=function(){document.getElementById(e).scrollIntoView({block:"center"})};document.createElement("center");var o=document.createElement("div");o.id="text",o.innerHTML=e,(navigator.userAgent.toLowerCase().indexOf("safari/")>-1||/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor))&&(o.style.right="27.5px"),a.appendChild(o),s.appendChild(a),n.appendChild(s),n.scrollTop=n.clientHeight+n.clientHeight}function J(){document.fullscreenElement?document.exitFullscreen&&document.exitFullscreen():(document.addEventListener("contextmenu",function(e){return e.preventDefault()}),document.documentElement.requestFullscreen())}function D(){window.location.href=window.location.href}function F(e){var t=e.childNodes[Object.keys(e.childNodes)[e.childNodes.length-1]],n=[];if("mc"==t.className){for(var s=0;s<t.childNodes.length;s++)1==t.childNodes[s].childNodes[0].checked&&n.push(s);return n}return"tf"==t.className?t.childNodes[0].checked?0:1:"matching"==t.className?(t="matching",15):"fr"==t.className?t.value:void 0}function Y(e){for(var t=0;t<e.length;t++)for(var n=1;n<e.length;n++)if(e[n-1].dataset.original>e[n].dataset.original){var s=e[n-1];e[n-1]=e[n],e[n]=s}return e}function P(){for(var e=[],t=Y(Array.prototype.slice.call(d)),n=0;n<t.length;n++){var s=F(t[n]);e.push(n+";"+s)}sessionStorage.setItem("student_answers",JSON.stringify(e)),document.getElementById("display-exam").style.display="none",document.getElementById("result").style.display="initial",U()}function U(){var e,t=JSON.parse(sessionStorage.getItem("student_answers"));firebase.database().ref("Teachers/"+sessionStorage.getItem("teacher")+"/Classes/"+sessionStorage.getItem("className")+"/Exams/"+sessionStorage.getItem("ExamCode")).once("value").then(function(n){n.forEach(function(t){null!=t.toJSON().questions&&(e=t.toJSON())});for(var s=0,a=0,o=0;o<d.length;o++){var l="",r=!1,m=!1;if("tf"==e.questions[o].type?(m=!0,(l=1==t[o].split(";")[1]?"false":"true")==e.questions[o].choices[0]?(s+=parseInt(e.questions[o].points),j(e.questions[o].title,t[o].split(";")[0],parseInt(e.questions[o].points))):G(e.questions[o].title,t[o].split(";")[0],parseInt(e.questions[o].points))):"mc"==e.questions[o].type?l=-1==t[o].indexOf(",")?parseInt(t[o].split(";")[1]):t[o].split(";")[1]:(r=!0,z(e.questions[o].title,t[o].split(";")[0],parseInt(e.questions[o].points)),a+=parseInt(e.questions[o].points)),!r&&!m)if("string"==typeof l&&-1!=l.indexOf(",")){for(var c=0;c<Object.keys(e.questions[o].checked).length;c++)for(var u=0;u<l.split(",").length;u++)e.questions[o].checked[c]==parseInt(l.split(",")[u])&&(s+=parseInt(e.questions[o].points)/l.split(",").length);s==parseInt(e.questions[o].points)?j(e.questions[o].title,t[o].split(";")[0],s):W(e.questions[o].title,t[o].split(";")[0],s,parseInt(e.questions[o].points))}else l==e.questions[o].checked?(s+=parseInt(e.questions[o].points),j(e.questions[o].title,t[o].split(";")[0],parseInt(e.questions[o].points))):G(e.questions[o].title,t[o].split(";")[0],parseInt(e.questions[o].points))}var p={score:(s/(e.examTotalPoints-a)*100).toFixed(1),time:i,answers:t,name:sessionStorage.getItem("StudentName"),totalScore:(s/e.examTotalPoints*100).toFixed(1)};firebase.database().ref("Teachers/"+sessionStorage.getItem("teacher")+"/Classes/"+sessionStorage.getItem("className")+"/Exams/"+sessionStorage.getItem("ExamCode")+"/responses/"+sessionStorage.getItem("StudentName")).push(p);var g=" Minutes";1==i&&(g=" Minute"),document.getElementById("score").innerHTML=p.score+"%",document.getElementById("score-num").innerHTML=s+" / "+(e.examTotalPoints-a)+" in "+i+g});document.getElementById("result")}function z(e,t,n){var s=document.getElementById("question-data"),a=document.createElement("div");a.style.width="90vw",a.style.marginTop="10px",a.style.border="1px solid black",a.style.padding="15px",a.style.height="50px",a.style.background="#798893",a.style.color="white",a.style.borderRadius="6px",a.className="questionBox";var o=document.createElement("span");o.innerHTML=parseInt(t)+1+" | "+e,o.style.float="left",o.style.paddingLeft="10px";var l=document.createElement("span");l.innerHTML="Free Response Questions Require Manual Grading (Points Possible: "+n+")",l.style.float="right",l.style.paddingRight="20px",a.appendChild(o),a.appendChild(l),s.appendChild(a)}function W(e,t,n,s){var a=document.getElementById("question-data"),o=document.createElement("div");o.style.width="90vw",o.style.marginTop="10px",o.style.border="1px solid black",o.style.padding="15px",o.style.height="50px",o.style.background="#eac07c",o.style.borderRadius="6px",o.className="questionBox";var l=document.createElement("span");l.innerHTML=parseInt(t)+1+" | "+e,l.style.float="left",l.style.paddingLeft="10px";var i=document.createElement("span");i.innerHTML="You Received "+n+" / "+s+" Points For This Question!",i.style.float="right",i.style.paddingRight="20px",o.appendChild(l),o.appendChild(i),a.appendChild(o)}function j(e,t,n){var s=document.getElementById("question-data"),a=document.createElement("div");a.style.width="90vw",a.style.marginTop="10px",a.style.border="1px solid black",a.style.padding="15px",a.style.height="50px",a.style.background="#84f277",a.style.borderRadius="6px",a.className="questionBox";var o=document.createElement("span");o.innerHTML=parseInt(t)+1+" | "+e,o.style.float="left",o.style.paddingLeft="10px";var l=document.createElement("span");l.innerHTML="You Received "+n+" / "+n+" Points For This Question!",l.style.float="right",l.style.paddingRight="20px",a.appendChild(o),a.appendChild(l),s.appendChild(a)}function G(e,t,n){var s=document.getElementById("question-data"),a=document.createElement("div");a.style.width="90vw",a.style.marginTop="10px",a.style.border="1px solid black",a.style.padding="15px",a.style.height="50px",a.style.background="#cc2d2d",a.style.color="white",a.style.borderRadius="6px",a.className="questionBox";var o=document.createElement("span");o.innerHTML=parseInt(t)+1+" | "+e,o.style.float="left",o.style.paddingLeft="10px";var l=document.createElement("span");l.innerHTML="You Received 0 / "+n+" Points For This Question",l.style.float="right",l.style.paddingRight="20px",a.appendChild(o),a.appendChild(l),s.appendChild(a)}g(y),y.addListener(g),document.addEventListener("keypress",function(e){13!==e.keyCode||s||C()},!1),l="";
},{}]},{},["NvjX"], null)
//# sourceMappingURL=/js.08339285.js.map