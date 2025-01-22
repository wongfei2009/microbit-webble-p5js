# ubitwebble.js
A JavaScript library for interacting with BBC micro:bit using Web Bluetooth API. Control LED matrix, read sensors, and exchange data wirelessly between micro:bit and web browsers.

## Installation

1. Download the library:
```bash
git clone https://github.com/wongfei2009/microbit-webble-p5js.git
```

2. Upload [this firmware](https://makecode.microbit.org/_Ts3FVcgFv457) to your micro:bit

3. Include in your project:
```html
<script src="ubitwebble.js"></script>
```

## Browser Support

| Browser | Support Status | Notes |
|---------|---------------|-------|
| Chrome 56+ | ✅ Full | Windows, Mac, Android |
| Edge (Chromium) | ✅ Full | Windows, Mac |
| Opera | ✅ Full | All platforms |
| Firefox | ❌ No | - |
| Safari | ❌ No | iOS or Mac |

## Quick Start

```javascript
// Create instance
const microBit = new uBitWebBluetooth();

// Connect
await microBit.searchDevice();

// Show a smile!
const smile = [
  ['0', '0', '0', '0', '0'],
  ['0', '1', '0', '1', '0'],
  ['0', '0', '0', '0', '0'], 
  ['1', '0', '0', '0', '1'],
  ['0', '1', '1', '1', '0']
];
microBit.writeMatrixIcon(smile);
```

## Running Examples Locally

1. Clone this repository:
   ```sh
   git clone https://github.com/wongfei2009/microbit-webble-p5js.git
   cd microbit-webble-p5js
   ```

2. Start a local web server. You can use:

   - Using Python 3:
     ```sh
     python3 -m http.server 8000
     ```
   
3. Open your web browser and navigate to:
   - http://localhost:8000/examples/basic/
   - http://localhost:8000/examples/accelerometer_3Dbox/
   - http://localhost:8000/examples/p5play_example/ 
   - http://localhost:8000/examples/uart_echotext/
   - http://localhost:8000/examples/uart_lightsensor/

Note: A local server is required because browsers restrict Web Bluetooth API access to secure contexts (HTTPS) or localhost.


## API Reference

### Connection
- `microBit.searchDevice()` - Connect to device
- `microBit.onConnect(callback)` - Connection success handler
- `microBit.onDisconnect(callback)` - Disconnection handler

### Inputs
- `microBit.setButtonACallback(callback)` - Button A press handler
- `microBit.setButtonBCallback(callback)` - Button B press handler
- `microBit.getAccelerometer()` - Get acceleration {x,y,z}
- `microBit.getTemperature()` - Get temperature (°C)
- `microBit.getBearing()` - Get compass heading (0-360°)

### Display
- `microBit.writeMatrixIcon(matrix)` - Show LED pattern
- `microBit.writeMatrixText(text)` - Show scrolling text
- `microBit.writeMatrixTextSpeed(speed)` - Set scroll speed

### Communication
- `microBit.writeUARTData(text)` - Send UART message
- `microBit.setReceiveUARTCallback(callback)` - Receive UART handler



