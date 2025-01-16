# ubitwebble.js
A JavaScript library for interacting with BBC micro:bit using Web Bluetooth API. Control LED matrix, read sensors, and exchange data wirelessly between micro:bit and web browsers.

![lars the iceberg](assets/lars.gif)

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

## Examples

1. **Basic Demo** - LED matrix control ([Try it](https://nkymut.github.io/microbit-webble-p5js/examples/basic/))
2. **3D Accelerometer** - Rotate cube with tilt ([Try it](https://nkymut.github.io/microbit-webble-p5js/examples/accelerometer_3Dbox/))
3. **Lars Game** - Complete game using micro:bit controls ([Try it](https://nkymut.github.io/microbit-webble-p5js/examples/p5play_Lars_example/))
4. **UART Echo** - Text communication ([Try it](https://nkymut.github.io/microbit-webble-p5js/examples/uart_echotext/))
5. **Light Sensor** - Read sensor data ([Try it](https://nkymut.github.io/microbit-webble-p5js/examples/uart_lightsensor/))


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



