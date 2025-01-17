/**
 * Micro:bit 3D Orientation Viewer - Kid-Friendly Version
 * This sketch creates a fun 3D character that moves with the Micro:bit's orientation.
 */

class MicrobitVisualizer {
    constructor() {
        this.microBit = new uBitWebBluetooth();
        this.canvas = null;
        
        // Add smoothed data storage
        this.rawAccelerometerData = { x: 0, y: 0, z: 0 };
        this.smoothedAccelerometerData = { x: 0, y: 0, z: 0 };
        
        // Constants
        this.ACCELEROMETER_RANGE = 980;
        this.BOX_SIZE = 150;
        this.BACKGROUND_COLOR = '#87CEEB'; // Sky blue background
        this.CHARACTER_COLOR = '#FF69B4'; // Pink base color
        this.EYE_COLOR = '#FFFFFF';
        this.PUPIL_COLOR = '#000000';
        this.SMILE_COLOR = '#FF0000';
        
        // Animation variables
        this.bounceOffset = 0;
        this.blinkTime = 0;
        this.isBlinking = false;
        
        // Separate smoothing factors for different axes
        this.SMOOTHING_FACTOR_XY = 0.85;  // For tilt (X and Y axes)
        this.SMOOTHING_FACTOR_Z = 0.92;   // Higher smoothing for rotation (Z axis)
        
        // Separate rotation sensitivity for different axes
        this.ROTATION_SENSITIVITY_XY = 0.7;  // For tilt
        this.ROTATION_SENSITIVITY_Z = 0.5;   // Less sensitive for rotation
        
        // Maximum rotation angles (in radians)
        this.MAX_ROTATION_XY = Math.PI / 3;
        this.MAX_ROTATION_Z = Math.PI / 2;

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
            this.resetData();
        });
    }

    resetData() {
        this.rawAccelerometerData = { x: 0, y: 0, z: 0 };
        this.smoothedAccelerometerData = { x: 0, y: 0, z: 0 };
    }

    updateStatusDisplay(connected) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = connected ? 'Connected! 😊' : 'Waiting for friend... 👋';
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

        // Add ambient light and directional light for better 3D effect
        ambientLight(60);
        directionalLight(255, 255, 255, 0.5, 0.5, -1);

        this.drawCharacter(isConnected);
    }

    smoothData(newValue, oldValue, smoothingFactor) {
        return oldValue * smoothingFactor + newValue * (1 - smoothingFactor);
    }

    constrainRotation(angle, maxRotation) {
        return constrain(angle, -maxRotation, maxRotation);
    }

    updateAccelerometerData() {
        const accel = this.microBit.getAccelerometer();
        
        this.rawAccelerometerData = {
            x: accel.x,
            y: accel.y,
            z: accel.z
        };
        
        // Use different smoothing factors for different axes
        this.smoothedAccelerometerData = {
            x: this.smoothData(this.rawAccelerometerData.x, this.smoothedAccelerometerData.x, this.SMOOTHING_FACTOR_Z),  // Z-rotation uses X
            y: this.smoothData(this.rawAccelerometerData.y, this.smoothedAccelerometerData.y, this.SMOOTHING_FACTOR_XY),
            z: this.smoothData(this.rawAccelerometerData.z, this.smoothedAccelerometerData.z, this.SMOOTHING_FACTOR_XY)
        };
    }

    drawCharacter(isConnected) {
        push();
        
        // Bouncing animation
        this.bounceOffset = sin(frameCount * 0.05) * 10;
        
        // Handle blinking
        if (frameCount % 120 === 0) { // Start blink every 120 frames
            this.isBlinking = true;
            this.blinkTime = 0;
        }
        if (this.isBlinking) {
            this.blinkTime += 1;
            if (this.blinkTime > 10) { // End blink after 10 frames
                this.isBlinking = false;
            }
        }

        translate(0, this.bounceOffset, 0);
        
        if (isConnected) {
            // Map smoothed accelerometer data to rotation angles
            const rotationZ = this.constrainRotation(
                map(
                    this.smoothedAccelerometerData.x,
                    -this.ACCELEROMETER_RANGE,
                    this.ACCELEROMETER_RANGE,
                    Math.PI / 2,
                    -Math.PI / 2
                ) * this.ROTATION_SENSITIVITY_Z,
                this.MAX_ROTATION_Z
            );

            const rotationX = this.constrainRotation(
                map(
                    this.smoothedAccelerometerData.y,
                    -this.ACCELEROMETER_RANGE,
                    this.ACCELEROMETER_RANGE,
                    -Math.PI / 2,
                    Math.PI / 2
                ) * this.ROTATION_SENSITIVITY_XY,
                this.MAX_ROTATION_XY
            );

            rotateZ(rotationZ);
            rotateX(rotationX);
        } else {
            // More playful idle animation
            rotateY(sin(frameCount * 0.02) * 0.3);
            rotateX(sin(frameCount * 0.03) * 0.2);
        }

        // Draw main body (rounded cube)
        fill(this.CHARACTER_COLOR);
        stroke(0);
        strokeWeight(2);
        box(this.BOX_SIZE, this.BOX_SIZE, this.BOX_SIZE, 20);

        // Draw eyes
        push();
        translate(0, -20, this.BOX_SIZE/2);
        
        // Left eye
        push();
        translate(-30, 0, 0);
        fill(this.EYE_COLOR);
        sphere(20);
        // Pupil
        translate(0, 0, 15);
        fill(this.PUPIL_COLOR);
        if (!this.isBlinking) {
            sphere(10);
        }
        pop();

        // Right eye
        push();
        translate(30, 0, 0);
        fill(this.EYE_COLOR);
        sphere(20);
        // Pupil
        translate(0, 0, 15);
        fill(this.PUPIL_COLOR);
        if (!this.isBlinking) {
            sphere(10);
        }
        pop();
        pop();

        // Draw smile
        push();
        translate(0, 20, this.BOX_SIZE/2);
        rotateX(PI/4);
        fill(this.SMILE_COLOR);
        noStroke();
        torus(30, 5);
        pop();
        
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