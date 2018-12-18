class SensorData {
    constructor(){
        this.alpha = 0;
        this.beta = 0;
        this.gamma = 0;
        this.orientation = window.orientation ? window.orientation : 0;
    }
}

// Transforms accelerometer alpha, beta, gamma information,
// then returns readable angles via yaw, pitch & roll
// yaw: y-axis rotations
// pitch: x-axis rotations
// roll: z-axis rotations

class Gimbal {
    constructor(){
        this.quaternion = new THREE.Quaternion();
        this.axisUp = new THREE.Vector3(0, 1, 0);
        this.axisFwd = new THREE.Vector3(0, 0, 1);
        this.sensorRotations = new THREE.Object3D();
        this.data = new SensorData();

        this.RAD = Math.PI / 180;
        this.DEG = 180 / Math.PI;

        this.eulerOrigin = new THREE.Euler();

        if(typeof window.orientation !== "undefined"){
            this.eulerOrigin.set(
                90 * this.RAD, 
                180 * this.RAD, 
                (180 + window.orientation) * this.RAD
            );
        }
    }

    enable() {
        this.onDeviceReorientation();

        window.addEventListener("deviceorientation", this.onSensorMove.bind(this), false);
        window.addEventListener("orientationchange", this.onDeviceReorientation.bind(this), false);
    }

    disable() {
        window.removeEventListener("deviceorientation", this.onSensorMove.bind(this), false);
        window.removeEventListener("orientationchange", this.onDeviceReorientation.bind(this), false);
    }

    //////////////////////////////////////////// EVENT LISTENERS  /////////////////////////////////////////////
    // When switching from portrait <---> landscape
    onDeviceReorientation() {
        this.data.orientation = (window.orientation * this.RAD) || 0;
    }

    // Update data when device detects movement
    onSensorMove(event) {
        // Alpha = z axis [0 ,360]
        // Beta = x axis [-180 , 180]
        // Gamma = y axis [-90 , 90]
        this.data.alpha = event.alpha;
        this.data.beta = event.beta;
        this.data.gamma = event.gamma;
    }

    // Called once per frame
    update() {
        // Reset rotation
        this.sensorRotations.setRotationFromEuler(this.eulerOrigin);

        // Apply gyroscope rotations
        this.sensorRotations.rotateZ(this.data.alpha * this.RAD);
        this.sensorRotations.rotateX(this.data.beta * this.RAD);
        this.sensorRotations.rotateY(this.data.gamma * this.RAD);
        this.sensorRotations.rotation.z -= this.data.orientation;

        // Extract quaternion from object
        this.quaternion.copy(this.sensorRotations.quaternion.inverse());

        // Apply quat to axes
        this.axisUp.set(0, 1, 0);
        this.axisUp.applyQuaternion(this.quaternion);
        this.axisFwd.set(0, 0, 1);
        this.axisFwd.applyQuaternion(this.quaternion);

        // Yaw is heading east (-) or west (+) rotation around y-axis.
        this.yaw = Math.atan2(this.axisFwd.x, this.axisFwd.z);

        // Pitch is pointing above or below (+/-) horizon line
        this.pitch = Math.atan2(this.axisUp.z, this.axisUp.y);

        // Roll is left (-) or right (+) rotation around local z-axis
        this.roll = Math.atan2(-this.axisUp.x, this.axisUp.y);
    }
}