var socket = io();
var item = document.createElement('li');

var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;
var d = document.createElement("div");

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  socket.emit('gamepad type', gamepad.id);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  scangamepads();
  const controller = [];
  const array = [];
  const leftStickArray = [];
  const rightStickArray = [];

  for (j in controllers) {
    const controllerInfo = controllers[j].buttons
    const controllerStickInfo = controllers[j].axes

    for (i = 0; i < controllerInfo.length; i++) {
      array.push({
        id: i,
        pressed: controllerInfo[i].pressed,
        value: controllerInfo[i].value
      })
    }

    // 0 = l x-axis
    // 1 = l y-axis
    // 2 = r x-axis
    // 3 = r y-axis

    leftStickArray.push({
      xaxis: controllerStickInfo[0],
      yaxis: controllerStickInfo[1]
    })

    rightStickArray.push({
      xaxis: controllerStickInfo[2],
      yaxis: controllerStickInfo[3]
    })

    controller.push({
      buttons: array,
      left: leftStickArray,
      right: rightStickArray
    })

    socket.emit('buttons pushed', controller)
  }
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
      controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler);
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);
}

socket.on('buttons pushed', (controller) => {
  var d = document.getElementById("controller");
  var buttons = d.getElementsByClassName("button");
  var sticks = d.getElementsByClassName("stick");
  var leftStick = sticks[0];
  var rightStick = sticks[1];

  const leftStickXAxis = controller[0].left[0].xaxis
  const leftStickYAxis = controller[0].left[0].yaxis

  const rightStickXAxis = controller[0].right[0].xaxis
  const rightStickYAxis = controller[0].right[0].yaxis

  controller[0].buttons.forEach(e => {
    var b = buttons[e.id];
    var val = e.value;
    var valRound = val.toFixed(3);
    var pressed = val == 1.0;
    var touched = false;
    if (typeof (val) == "object") {
      pressed = val.pressed;
      if ('touched' in val) {
        touched = val.touched;
      }
      val = val.value;
    }
    var pct = Math.round(val * 100) + "%";
    if (e.id == 6 || e.id == 7) {
      b.style.display = "block"
      b.className = "button";
      b.style.objectPosition = "0em " + valRound + "em"
      if (pressed) {
        b.className += " pressed";
      }
    } else if (e.id == 4 || e.id == 5) {
      b.style.display = "block"
      b.className = "button";
      if (pressed) {
        b.className += " pressed";
        b.style.objectPosition = "0em 0.30em"
      } else {
        b.style.objectPosition = "0"
      }
    } else {
      b.style.display = "none"
      b.className = "button";
      if (pressed) {
        b.className += " pressed";
        b.style.display = "block"
      }
      if (touched) {
        b.className += " touched";
      }
    }
  })

  leftStick.style.objectPosition = (leftStickXAxis.toFixed(3) * 0.85) + "em" + " " + (leftStickYAxis.toFixed(3) * 0.85) + "em";

  rightStick.style.objectPosition = (rightStickXAxis.toFixed(3) * 0.85) + "em" + " " + (rightStickYAxis.toFixed(3) * 0.85) + "em";

  rAF(updateStatus);
})

socket.on('gamepad type', (id) => {
  d.append(id)
});