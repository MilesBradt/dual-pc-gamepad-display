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

        // console.log("left x-axis: " + leftStickArray[0].xaxis)
        // console.log("left y-axis: " + leftStickArray[0].yaxis)

        // console.log("right x-axis: " + rightStickArray[0].xaxis)
        // console.log("right y-axis: " + rightStickArray[0].yaxis)

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
        b.style.display = "none"
        b.className = "button";
        if (pressed) {
          b.className += " pressed";
          b.style.display = "block"
        }
        if (touched) {
          b.className += " touched";
        }
      })

      leftStick.style.objectPosition = (leftStickXAxis.toFixed(3) * 0.5) + "cm" + " " + (leftStickYAxis.toFixed(3) * 0.5) + "cm";

      rightStick.style.objectPosition = (rightStickXAxis.toFixed(3) * 0.5) + "cm" + " " + (rightStickYAxis.toFixed(3) * 0.5) + "cm";

      rAF(updateStatus);
    })

    socket.on('gamepad type', (id) => {
      console.log("it got here: " + id)
      d.append(id)
    });