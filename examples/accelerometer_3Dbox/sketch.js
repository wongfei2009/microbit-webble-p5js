/**
 * Micro:bit 3D Orientation Viewer
 * This sketch creates a 3D visualization of a Micro:bit's orientation using its accelerometer data.
 */

class MicrobitVisualizer {
    constructor() {
        this.microBit = new uBitWebBluetooth();
        this.canvas = null;
        this.accelerometerData = { x: 0, y: 0, z: 0 };

        // Constants
        this.ACCELEROMETER_RANGE = 980; // Maximum accelerometer value
        this.BOX_SIZE = 150;
        this.BACKGROUND_COLOR = 78;

        this.setupEventListeners();
    }

    setup() {
        // Create canvas inside container for better styling
        const container = document.getElementById('canvas-container');
        this.canvas = createCanvas(400, 400, WEBGL);
        this.canvas.parent(container);

        // Initialize status display
        this.updateStatusDisplay(false);
    }

    setupEventListeners() {
        // Connect button
        document.getElementById('connect-btn').addEventListener('click', () => {
            this.microBit.searchDevice();
        });

        // Disconnect button
        document.getElementById('disconnect-btn').addEventListener('click', () => {
            this.microBit.disconnectDevice();
        });
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

        // Update connection status continuously
        this.updateStatusDisplay(this.microBit.connected && this.microBit.server.connected);

        if (this.microBit.connected) {
            this.updateAccelerometerData();
        }

        this.drawCube();
    }

    updateAccelerometerData() {
        const accel = this.microBit.getAccelerometer();
        this.accelerometerData = {
            x: accel.x,
            y: accel.y,
            z: accel.z
        };

        // Log data for debugging (comment out in production)
        // console.log(`X: ${this.accelerometerData.x} Y: ${this.accelerometerData.y} Z: ${this.accelerometerData.z}`);
    }

    drawCube() {
        noStroke();
        push();

        if (this.microBit.connected) {
            // Map accelerometer data to rotation angles
            const rotationZ = map(
                this.accelerometerData.x,
                -this.ACCELEROMETER_RANGE,
                this.ACCELEROMETER_RANGE,
                Math.PI / 2,
                -Math.PI / 2
            );

            const rotationX = map(
                this.accelerometerData.y,
                -this.ACCELEROMETER_RANGE,
                this.ACCELEROMETER_RANGE,
                -Math.PI / 2,
                Math.PI / 2
            );

            rotateZ(rotationZ);
            rotateX(rotationX);
        }

        box(this.BOX_SIZE);
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