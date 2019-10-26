// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"assets/js/teacher_pong.js":[function(require,module,exports) {
// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
}();

window.cancelRequestAnimFrame = function () {
  return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
}(); // Initialize canvas and required variables


var canvas = document.getElementById("pong-canvas"),
    ctx = canvas.getContext("2d"),
    // Create canvas context
W = window.innerWidth,
    // Window's width
H = window.innerHeight - 55,
    // Window's height
particles = [],
    // Array containing particles
ball = {},
    // Ball object
paddles = [3],
    // Array containing two paddles
mouse = {},
    // Mouse object to store it's current position
points = 0,
    // Varialbe to store points
fps = 60,
    // Max FPS (frames per second)
particlesCount = 20,
    // Number of sparks when ball strikes the paddle
flag = 0,
    // Flag variable which is changed on collision
particlePos = {},
    // Object to contain the position of collision
multipler = 1,
    // Varialbe to control the direction of sparks
startBtn = {},
    // Start button object
restartBtn = {},
    // Restart button object
over = 0,
    // flag varialbe, cahnged when the game is over
init,
    // variable to initialize animation
paddleHit,
    students = [],
    isPaused = false;

document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    if (!isPaused) {
      cancelRequestAnimFrame(init);
      isPaused = true;
    } else {
      animloop();
      isPaused = false;
    }
  }
};

firebase.database().ref('Students').on('value', function (snapshot) {
  snapshot.forEach(function (childSnapshot) {
    students.push(childSnapshot.val());
  });
}); // Add mousemove and mousedown events to the canvas

canvas.addEventListener("mousemove", trackPosition, true);
canvas.addEventListener("mousedown", btnClick, true); // Set the canvas's height and width to full screen

canvas.width = W;
canvas.height = H; // Function to paint canvas

function paintCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, W, H);
} // Function for creating paddles


function Paddle(pos) {
  // Height and width
  this.h = 5;
  this.w = 150; // Paddle's position

  this.x = W / 2 - this.w / 2;
  this.y = pos == "top" ? 0 : H - this.h;
} // Push two new paddles into the paddles[] array


paddles.push(new Paddle("bottom"));
paddles.push(new Paddle("top")); // Ball object

ball = {
  x: 50,
  y: 50,
  r: 5,
  c: "white",
  vx: 4,
  vy: 8,
  // Function for drawing ball on canvas
  draw: function draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    ctx.fill();
  }
}; // Start Button object

startBtn = {
  w: 100,
  h: 50,
  x: W / 2 - 50,
  y: H / 2 - 25,
  draw: function draw() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = "2";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.font = "18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStlye = "white";
    ctx.fillText("Start", W / 2, H / 2);
  }
}; // Restart Button object

restartBtn = {
  w: 100,
  h: 50,
  x: W / 2 - 50,
  y: H / 2 - 50,
  draw: function draw() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = "2";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.font = "18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStlye = "white";
    ctx.fillText("Restart", W / 2, H / 2 - 25);
  }
}; // Function for creating particles object

function createParticles(x, y, m) {
  this.x = x || 0;
  this.y = y || 0;
  this.radius = 1.2;
  this.vx = -1.5 + Math.random() * 3;
  this.vy = m * Math.random() * 1.5;
} // Draw everything on canvas


function draw() {
  paintCanvas();

  for (var i = 0; i < paddles.length; i++) {
    p = paddles[i];
    ctx.fillStyle = "white";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  ball.draw();
  update();
} // Function to increase speed after every 5 points


function increaseSpd() {
  if (points % 4 == 0) {
    if (Math.abs(ball.vx) < 15) {
      ball.vx += ball.vx < 0 ? -1 : 1;
      ball.vy += ball.vy < 0 ? -2 : 2;
    }
  }
} // Track the position of mouse cursor


function trackPosition(e) {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
} // Function to update positions, score and everything.
// Basically, the main game logic is defined here


function update() {
  // Update scores
  updateScore();
  ctx.fillStlye = "white";
  ctx.font = "16px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText("Press 'space' to pause ", window.innerWidth - 20, 20); // Move the paddles on mouse move

  var isNotMobile = !window.matchMedia("only screen and (max-width: 760px)").matches;

  if (isNotMobile) {
    if (mouse.x && mouse.y) {
      for (var i = 1; i < paddles.length; i++) {
        p = paddles[i];
        p.x = mouse.x - p.w / 2;
      }
    }
  } // Move the ball


  ball.x += ball.vx;
  ball.y += ball.vy; // Collision with paddles

  p1 = paddles[1];
  p2 = paddles[2]; // If the ball strikes with paddles,
  // invert the y-velocity vector of ball,
  // increment the points, play the collision sound,
  // save collision's position so that sparks can be
  // emitted from that position, set the flag variable,
  // and change the multiplier

  if (collides(ball, p1)) {
    collideAction(ball, p1);
  } else if (collides(ball, p2)) {
    collideAction(ball, p2);
  } else {
    // Collide with walls, If the ball hits the top/bottom,
    // walls, run gameOver() function
    if (ball.y + ball.r > H) {
      ball.y = H - ball.r;
      gameOver();
    } else if (ball.y < 0) {
      ball.y = ball.r;
      gameOver();
    } // If ball strikes the vertical walls, invert the
    // x-velocity vector of ball


    if (ball.x + ball.r > W) {
      ball.vx = -ball.vx;
      ball.x = W - ball.r;
    } else if (ball.x - ball.r < 0) {
      ball.vx = -ball.vx;
      ball.x = ball.r;
    }
  } // If flag is set, push the particles


  if (flag == 1) {
    for (var k = 0; k < particlesCount; k++) {
      particles.push(new createParticles(particlePos.x, particlePos.y, multiplier));
    }
  } // Emit particles/sparks


  emitParticles(); // reset flag

  flag = 0;
}

mc.on('pan', function (ev) {
  for (var i = 1; i < paddles.length; i++) {
    p = paddles[i];
    p.x = ev.center.x - p.w;
  }
}); //Function to check collision between ball and one of
//the paddles

function collides(b, p) {
  if (b.x + ball.r >= p.x && b.x - ball.r <= p.x + p.w) {
    if (b.y >= p.y - p.h && p.y > 0) {
      paddleHit = 1;
      return true;
    } else if (b.y <= p.h && p.y == 0) {
      paddleHit = 2;
      return true;
    } else return false;
  }
} //Do this when collides == true


function collideAction(ball, p) {
  ball.vy = -ball.vy;

  if (paddleHit == 1) {
    ball.y = p.y - p.h;
    particlePos.y = ball.y + ball.r;
    multiplier = -1;
  } else if (paddleHit == 2) {
    ball.y = p.h + ball.r;
    particlePos.y = ball.y - ball.r;
    multiplier = 1;
  }

  points++;
  increaseSpd();
  particlePos.x = ball.x;
  flag = 1;
} // Function for emitting particles


function emitParticles() {
  for (var j = 0; j < particles.length; j++) {
    par = particles[j];
    ctx.beginPath();
    ctx.fillStyle = "white";

    if (par.radius > 0) {
      ctx.arc(par.x, par.y, par.radius, 0, Math.PI * 2, false);
    }

    ctx.fill();
    par.x += par.vx;
    par.y += par.vy; // Reduce radius so that the particles die after a few seconds

    par.radius = Math.max(par.radius - 0.05, 0.0);
  }
} // Function for updating score


function updateScore() {
  ctx.fillStlye = "white";
  ctx.font = "16px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + points, 20, 20);
} // Function to run when the game overs


function gameOver() {
  ctx.fillStlye = "white";
  ctx.font = "20px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over - You scored " + points + " points!", W / 2, H / 2 + 25);
  submitToLeaderboard(userName); // Stop the Animation

  cancelRequestAnimFrame(init); // Set the over flag

  over = 1; // Show the restart button

  restartBtn.draw();
}

function submitToLeaderboard(userName) {
  var possibleDuplicates = [];
  firebase.database().ref('leaderboard').push("Teacher;" + userName + ";" + points);
  firebase.database().ref('leaderboard').on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      if (userName == childSnapshot.val().split(";")[1]) {
        possibleDuplicates.push(childSnapshot.val() + ";" + childSnapshot.key);
      }
    });
    var highest = -111111111;

    for (var i = 0; i < possibleDuplicates.length; i++) {
      if (possibleDuplicates[i].split(";")[2] > highest) {
        highest = possibleDuplicates[i].split(";")[2];
      }
    }

    for (i = 0; i < possibleDuplicates.length; i++) {
      if (possibleDuplicates[i].split(";")[2] != highest) {
        firebase.database().ref('leaderboard').child(possibleDuplicates[i].split(";")[3]).remove();
      }
    }
  });
}

function populateLeaderboard() {
  jQuery('.tr').remove();
  jQuery('.br').remove();
  var leaderboard = [];
  var lb = document.getElementById('table');
  document.getElementById('pong').style.display = "none";
  document.getElementById('leaderboard').style.display = "initial";
  document.getElementById('main').style.display = "none";
  firebase.database().ref('leaderboard').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      leaderboard.push(childSnapshot.val());
    });
  });
  setTimeout(function () {
    leaderboard = leaderboardSort(leaderboard);

    for (var i = leaderboard.length - 1; i >= 0; i--) {
      var tr = document.createElement('tr');
      tr.className = "tr";
      var index = document.createElement('td');
      var name = document.createElement('td');
      var score = document.createElement('td');
      var status = document.createElement('td');
      index.innerHTML = leaderboard.length - i;
      index.style.paddingLeft = "20px";
      name.innerHTML = leaderboard[i].split(";")[1];
      name.className = "name";
      name.style.paddingLeft = "10px";
      score.innerHTML = leaderboard[i].split(";")[2];
      score.style.paddingLeft = "10px";
      status.innerHTML = leaderboard[i].split(";")[0];
      status.style.paddingLeft = "10px";

      if (i == leaderboard.length - 1) {
        var br = document.createElement('br');
        br.className = "br";
        lb.appendChild(br);
      }

      tr.appendChild(index);
      tr.appendChild(name);
      tr.appendChild(score);
      tr.appendChild(status);
      lb.appendChild(tr);
      var br = document.createElement('br');
      br.className = "br";
      lb.appendChild(br);
    }
  }, 150);
} //implement merge sort for leaderboard


function leaderboardSort(arr) {
  if (arr.length == 1) {
    // return once we hit an array with a single item
    return arr;
  }

  var middle = Math.floor(arr.length / 2); // get the middle item of the array rounded down

  var left = arr.slice(0, middle); // items on the left side

  var right = arr.slice(middle); // items on the right side

  return leaderboardMerge(leaderboardSort(left), leaderboardSort(right));
} // compare the arrays item by item and return the concatenated result


function leaderboardMerge(left, right) {
  var result = [];
  var indexLeft = 0;
  var indexRight = 0;

  while (indexLeft < left.length && indexRight < right.length) {
    if (parseInt(left[indexLeft].split(";")[1]) < parseInt(right[indexRight].split(";")[1])) {
      result.push(left[indexLeft]);
      indexLeft++;
    } else {
      result.push(right[indexRight]);
      indexRight++;
    }
  }

  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
}

function getStudent(id) {
  students = studentMerge(students); //binary search for finding ID pos

  var low = 0,
      high = students.length - 1,
      mid;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    if (students[mid].split(";")[0] == id) return students[mid];else if (students[mid].split(";")[0] < id) low = mid + 1;else high = mid - 1;
  }

  return -1;
} //implement merge sort


function studentMerge(arr) {
  if (arr.length === 1) {
    // return once we hit an array with a single item
    return arr;
  }

  var middle = Math.floor(arr.length / 2); // get the middle item of the array rounded down

  var left = arr.slice(0, middle); // items on the left side

  var right = arr.slice(middle); // items on the right side

  return mergeStudents(studentMerge(left), studentMerge(right));
} // compare the arrays item by item and return the concatenated result


function mergeStudents(left, right) {
  var result = [];
  var indexLeft = 0;
  var indexRight = 0;

  while (indexLeft < left.length && indexRight < right.length) {
    if (left[indexLeft].split(";")[0] < right[indexRight].split(";")[0]) {
      result.push(left[indexLeft]);
      indexLeft++;
    } else {
      result.push(right[indexRight]);
      indexRight++;
    }
  }

  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
} // Function for running the whole animation


function animloop() {
  init = requestAnimFrame(animloop);
  draw();
} // Function to execute at startup


function startScreen() {
  draw();
  startBtn.draw();
} // On button click (Restart and start)


function btnClick(e) {
  // Variables for storing mouse position on click
  var mx = e.pageX,
      my = e.pageY; // Click start button

  if (mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
    animloop(); // Delete the start button after clicking it

    startBtn = {};
  } // If the game is over, and the restart button is clicked


  if (over == 1) {
    if (mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
      ball.x = 20;
      ball.y = 20;
      points = 0;
      ball.vx = 4;
      ball.vy = 8;
      animloop();
      over = 0;
    }
  }
} // Show the start screen


startScreen();
},{}],"../.nvm/versions/node/v13.0.1/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55938" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../.nvm/versions/node/v13.0.1/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","assets/js/teacher_pong.js"], null)
//# sourceMappingURL=/teacher_pong.d07f2d23.js.map