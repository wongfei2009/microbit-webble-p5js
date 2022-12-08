var microBit;
var canvas;

function preload() {

}

function setup() {
  canvas = createCanvas(400, 400, WEBGL);

  microBit=new uBitWebBluetooth();

  //define connect and disconnect buttons
  const connectButton = createButton("Connect");
  connectButton.mousePressed(() => {microBit.searchDevice()});
 
  // connectButton.mousePressed(microBit.searchDevice);
  const disconnectButton = createButton("Disconnect");
  disconnectButton.mousePressed(() => {microBit.disconnectDevice()});

  microBit.onConnect(function(){
    console.log("connected");
  });

  microBit.onDisconnect(function(){
    console.log("disconnected");
  });

}

function draw() {
  background(78);
  if (microBit.connected){

    noStroke();
    push();
    print("X:"+microBit.getAccelerometer().x);
    print("Y:"+microBit.getAccelerometer().y);
    print("Z:"+microBit.getAccelerometer().z);

    rotateZ(map(microBit.getAccelerometer().x,-980,980,Math.PI/2,-Math.PI/2));
    rotateX(map(microBit.getAccelerometer().y,-980,980,-Math.PI/2,Math.PI/2));
    box(150);
    pop();

  }

}

function searchDevice(){
  microBit.searchDevice();
}
