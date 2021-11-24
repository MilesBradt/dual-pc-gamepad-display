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
      console.log(e.gamepad)
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
      const array = []
      for (j in controllers) {
        const controllerInfo = controllers[j].buttons
        for (i = 0; i < controllerInfo.length; i++) {
          array.push({
            id: i,
            pressed: controllerInfo[i].pressed,
            value: controllerInfo[i].value
          })
        }
        socket.emit('buttons pushed', array)
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

    socket.on('buttons pushed', (btn) => {
      var d = document.getElementById("controller");
      var buttons = d.getElementsByClassName("button");
      btn.forEach(e => {
        var b = buttons[e.id];
        var val = e.value;
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
        b.style.backgroundSize = pct + " " + pct;
        b.className = "button";
        if (pressed) {
          b.className += " pressed";
        }
        if (touched) {
          b.className += " touched";
        }
      })
      rAF(updateStatus);
    })

    socket.on('gamepad type', (id) => {
      console.log("it got here: " + id)
      d.append(id)
    });