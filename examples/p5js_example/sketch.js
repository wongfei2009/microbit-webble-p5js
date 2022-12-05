var microBit;
var canvas;
var button;

var iconLeft = [
  ['0', '0', '0', '0', '0'],
  ['0', '1', '0', '1', '0'],
  ['0', '0', '0', '0', '0'],
  ['1', '0', '0', '0', '1'],
  ['0', '1', '1', '1', '0']
]

var iconRight = [
  ['0', '0', '0', '0', '0'],
  ['0', '1', '0', '1', '0'],
  ['0', '0', '0', '0', '0'],
  ['0', '1', '1', '1', '0'],
  ['1', '0', '0', '0', '1']
]

function preload() {

}

function setup() {
  canvas = createCanvas(710, 400, WEBGL);

  microBit=new uBitWebBluetooth();

  //define connect and disconnect buttons
  const connectButton = createButton("Connect");
  connectButton.mousePressed(() => {microBit.searchDevice()});
 
  // connectButton.mousePressed(microBit.searchDevice);
  const disconnectButton = createButton("Disconnect");
  disconnectButton.mousePressed(() => {microBit.disconnectDevice()});
  microBit.setButtonACallback(function(){
    console.log("buttonA pressed");
    microBit.writeMatrixIcon(iconLeft);

  });

  microBit.setButtonBCallback(function(){
    console.log("buttonB pressed");
    microBit.writeMatrixText("CIAO!");
  });

  microBit.onConnect(function(){
    console.log("connected");
  });

  microBit.onDisconnect(function(){
    console.log("disconnected");
  });

}

function draw() {
  background(23);
  if (microBit.connected){

    noStroke();
    push();
    rotateX(microBit.getAccelerometer().x/10);
    rotateY(microBit.getAccelerometer().y/10);
    box(150);
    pop();

  }


}

function searchDevice(){
  microBit.searchDevice();
}
