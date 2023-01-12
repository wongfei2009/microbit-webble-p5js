# microbit-webble.js
A javascript library to interact with [BBC micro:bit](http://microbit.org/) using web bluetooth API.
![lars the iceberg](assets/lars.gif)

## Usage

To use the library, download and upload [this firmware](https://makecode.microbit.org/_Ts3FVcgFv457) on your BBC micro:bit board.

Keep in mind that web bluetooth API are still experimental and your OS and browser might not support the feature. Read more about this [here](https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web).

Please refer to the following table for the supported browsers. 

| Browser | [WebUSB](https://caniuse.com/webusb)  |　[WebBluetooth](https://caniuse.com/web-bluetooth)|
|---|:---:|:---:|
| Chrome (Win/Mac) / Edge  |○|○|
| Safari |×|×|
| Firefox |×|×|
| Opera |○|○|
| Chrome on Android |○|○|
| Safari on iOS|×|×|
| Chromium on Raspberry PI |_|_|

This Library allows you to read and write the values of all the BLEcharacteristic exposed by the microBit board using simplified API's.

For more info about all micro:bit ble services please refer to the [official documentation](https://lancaster-university.github.io/microbit-docs/ble/profile/).

The example folder provided contains several examples for interacting with the device.

## Constructor

- `microBit=new uBitWebBluetooth()`

## Properties

- `microBit.connected`

## Functions


- `microBit.searchDevice()` or `microBit.connectDevice()`

  Search for ble devices in range.
　<br><br>example:
  ```js
  connectButton = createButton("connect");
  connectButton.mousePressed(
    function(){
      microBit.searchDevice();
    }
  );
  ```

- `microBit.setButtonACallback(callbackFunction)`

  Register a callback function to be invoked when Button A is pressed.

  example:
  ```js
  microBit.setButtonACallback(
    function(){
      console.log("buttonA pressed");
    }
  );
  ```

- `microBit.setButtonBCallback(callbackFunction)`

  Register a callback function to be invoked when Button B is pressed.

  example:
  ```js
  microBit.setButtonBCallback(
    function(){
      console.log("buttonB pressed");
    }
  );
  ```

- `microBit.onConnect(callbackFunction)`

  Register a callback function invoked when the microBit connects

  example:
  ```js
  microBit.onConnect(
    function(){
      console.log("connected");
    }
  );
  ```

- `microBit.onDisconnect(callbackFunction)`

  Register a callback function invoked when the microBit disconnects

  example:
  ```js
  microBit.onDisconnect(
    function(){
      console.log("disconnected");
    }
  );
  ```

- `microBit.onBleNotify(callbackFunction)`

  Register a callback function invoked every time the value of characteristic changes and it is notified by the device.

  example:
  ```js
  microBit.onBleNotify(
    function(){
      document.getElementById("buttonA").innerHTML=microBit.getButtonA();
    }
  );
  ```

- `microBit.setReceiveUARTCallback(callbackFunction)`
- `microBit.onReceiveUART(callbackFunction)`
- `microBit.onReceiveSerial(callbackFunction)`

  Register a callback function to be invoked when UART data is received.

  example:
  ```js
  microBit.setReceiveUARTCallback(
    function(data){
      console.log("UART received",data);
      receivedText = data;
    }
  );
  ```

- `microBit.writeUARTData(text)`
  
  Send text message to microbit via UART.

  example:
  ```js
  var messageText = "Hello!";
  microBit.writeUARTData(messageText);
  ```
- `microBit.writeMatrixIcon(icon)`

  Updates the led matrix on the microbit.
  The `icon` passed to the function must be 5x5 matrix.
  0=led off;
  1=led on;

  example:
  ```js
  var ledMatrix = [
    ['0', '0', '0', '0', '0'],
    ['0', '1', '0', '1', '0'],
    ['0', '0', '0', '0', '0'],
    ['1', '0', '0', '0', '1'],
    ['0', '1', '1', '1', '0']
  ]

  microBit.writeMatrixIcon(ledMatrix);

  ```

- `microBit.writeMatrixText(text)`

  Updates the led matrix of the microbit with a scrolling text.

  example:
  ```js
  microBit.writeMatrixText("ciao microBit")
  ```

- `writeMatrixTextSpeed(speed)`

  set the speed of the scrolling text on the matrix
  example:
  ```js
  microBit.writeMatrixTextSpeed(10)
  ```

- `microBit.getAccelerometer()`

  Returns the value of the accelerometer as a object.

  example:
  ```js
  acceleration=microBit.getAccelerometer();
  acc_x=acceleration.x;
  acc_y=acceleration.y;
  acc_z=acceleration.z;

  ```

- `microBit.getTemperature()`

  Returns the value of the temperature measured on the processor in celsius.

  example:
  ```js
  temperature=microBit.getTemperature();

  ```


- `microBit.getBearing()`

  Returns the value of magnetometer bearing from 0 to 360.
  0= pointing nord

  example:
  ```js
  bearing=microBit.getBearing();

  ```



## Examples
Check the examples folder for working examples.

### Basic example
Connect your microbit to a webpage, visualize the data and change the animations on the led matrix.

[micro:bit code](https://makecode.microbit.org/61779-39134-92711-11083)

[Try it here](https://nkymut.github.io/microbit-webble-p5js/examples/basic/)

![web ble demo](assets/html.gif)


### Accelerometer Cube example
Learn how to interact with the microbit from a [p5.js](https://p5js.org/) sketch, rotate a cube on the canva reading the accelerometer.

[micro:bit code](https://makecode.microbit.org/61779-39134-92711-11083)

[Try it here](https://nkymut.github.io/microbit-webble-p5js/examples/accelerometer_3Dbox/)

### Lars the iceberg
Use the microBit to control Lars the iceberg. Don't let it melt!
Developed using [p5.js](https://p5js.org/) and [p5.play](http://p5play.molleindustria.org/) library.

[micro:bit code](https://makecode.microbit.org/61779-39134-92711-11083)


[Try it here](https://nkymut.github.io/microbit-webble-p5js/examples/p5play_Lars_example/)


### UART Echo example
Learn how to exchange text messages between the microbit and a [p5.js](https://p5js.org/) sketch via UART, update microBit's LED message from the sketch.

[micro:bit code](https://makecode.microbit.org/_eKA9KJAoFAAV
)

[Try it here](https://nkymut.github.io/microbit-webble-p5js/examples/uart_echotext/)

### UART LightSensor example
Learn how to receive lightsensor value from the microbit and update a [p5.js](https://p5js.org/) sketch via UART.


[micro:bit code](https://makecode.microbit.org/_F8DFrygkTRP1) for micro:bit v2

[micro:bit code](https://nkymut.github.io/microbit-webble-p5js/examples/RecvUARTLightSensor/microbit_code/microbit-LightSensorBLEUARTv01.hex) for micro:bit v1

[Try it here](https://nkymut.github.io/microbit-webble-p5js/examples/uart_lightsensor/)



