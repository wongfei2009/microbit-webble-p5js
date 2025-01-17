/**
 * Micro:bit 3D Orientation Viewer
 * This sketch creates a 3D visualization of a Micro:bit's orientation using its accelerometer data.
 */

class MicrobitVisualizer {
    constructor() {
        this.microBit = new uBitWebBluetooth();
        this.canvas = null;
        
        // Add smoothed data storage
        this.rawAccelerometerData = { x: 0, y: 0, z: 0 };
        this.smoothedAccelerometerData = { x: 0, y: 0, z: 0 };
        
        // Constants
        this.ACCELEROMETER_RANGE = 980; // Maximum accelerometer value
        this.BOX_SIZE = 150;
        this.BACKGROUND_COLOR = 78;
        
        // Smoothing factor (0 = no smoothing, 1 = infinite smoothing)
        this.SMOOTHING_FACTOR = 0.85;
        
        // Rotation sensitivity (lower = less sensitive)
        this.ROTATION_SENSITIVITY = 0.7;
        
        // Maximum rotation angles (in radians)
        this.MAX_ROTATION = Math.PI / 3;

        this.setupEventListeners();
    }

    setup() {
        const container = document.getElementById('canvas-container');
        this.canvas = createCanvas(400, 400, WEBGL);
        container.appendChild(this.canvas.elt);      
        this.updateStatusDisplay(false);
    }

    setupEventListeners() {
        document.getElementById('connect-btn').addEventListener('click', () => {
            this.microBit.searchDevice();
        });

        document.getElementById('disconnect-btn').addEventListener('click', () => {
            this.microBit.disconnectDevice();
            // Reset data when disconnecting
            this.resetData();
        });
    }

    resetData() {
        this.rawAccelerometerData = { x: 0, y: 0, z: 0 };
        this.smoothedAccelerometerData = { x: 0, y: 0, z: 0 };
    }

    updateStatusDisplay(connected) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = connected ? 'Connected' : 'Disconnected';
        if (connected) {
            statusElement.classList.add('connected');
        } else {
            statusElement.classList.remove('connected');
        }
    }

    draw() {
        background(this.BACKGROUND_COLOR);
        
        // Update connection status
        const isConnected = this.microBit.connected && this.microBit.server.connected;
        this.updateStatusDisplay(isConnected);

        if (isConnected) {
            this.updateAccelerometerData();
        }

        this.drawCube();
    }

    smoothData(newValue, oldValue) {
        return oldValue * this.SMOOTHING_FACTOR + newValue * (1 - this.SMOOTHING_FACTOR);
    }

    constrainRotation(angle) {
        return constrain(angle, -this.MAX_ROTATION, this.MAX_ROTATION);
    }

    updateAccelerometerData() {
        const accel = this.microBit.getAccelerometer();
        
        // Update raw data
        this.rawAccelerometerData = {
            x: accel.x,
            y: accel.y,
            z: accel.z
        };
        
        // Apply smoothing
        this.smoothedAccelerometerData = {
            x: this.smoothData(this.rawAccelerometerData.x, this.smoothedAccelerometerData.x),
            y: this.smoothData(this.rawAccelerometerData.y, this.smoothedAccelerometerData.y),
            z: this.smoothData(this.rawAccelerometerData.z, this.smoothedAccelerometerData.z)
        };
    }

    drawCube() {
        
        push();
        
        if (this.microBit.connected) {
            // Map smoothed accelerometer data to rotation angles with sensitivity adjustment
            const rotationZ = this.constrainRotation(
                map(
                    this.smoothedAccelerometerData.x,
                    -this.ACCELEROMETER_RANGE,
                    this.ACCELEROMETER_RANGE,
                    Math.PI / 2,
                    -Math.PI / 2
                ) * this.ROTATION_SENSITIVITY
            );

            const rotationX = this.constrainRotation(
                map(
                    this.smoothedAccelerometerData.y,
                    -this.ACCELEROMETER_RANGE,
                    this.ACCELEROMETER_RANGE,
                    -Math.PI / 2,
                    Math.PI / 2
                ) * this.ROTATION_SENSITIVITY
            );

            // Apply rotations
            rotateZ(rotationZ);
            rotateX(rotationX);
            
        } else {
            // Add idle animation when disconnected
            rotateY(frameCount * 0.02);
            rotateX(sin(frameCount * 0.02) * 0.1);
        }

        // Draw the box with slightly rounded edges
        box(this.BOX_SIZE, this.BOX_SIZE, this.BOX_SIZE, 4);
        
        pop();
    }
}

// Global instance
let visualizer;

function setup() {
    visualizer = new MicrobitVisualizer();
    visualizer.setup();
}

function draw() {
    visualizer.draw();
}