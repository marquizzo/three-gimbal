// Gimbal.js
// =========
// Transforms accelerometer alpha, beta, gamma information,
// then returns readable angles via yaw, pitch & roll
// yaw: y-axis rotations
// pitch: x-axis rotations
// roll: z-axis rotations

class Gimbal {
    constructor() {
        this.quaternion = new THREE.Quaternion();
        this.quatOrigin = new THREE.Quaternion();
        this.axisUp = new THREE.Vector3(0, 1, 0);
        this.axisFwd = new THREE.Vector3(0, 0, 1);
        this.vectorUp = new THREE.Vector3();
        this.vectorFwd = new THREE.Vector3();
        this.sensorRotations = new THREE.Object3D();
        this.data = {
            alpha : 0,
            beta : 0,
            gamma : 0,
            orientation : window.orientation ? window.orientation : 0
        };

        this.needsUpdate = false;
        this.recalRequested = false;

        this.RAD = Math.PI / 180;
        this.DEG = 180 / Math.PI;

        this.eulerOrigin = new THREE.Euler();

        if (typeof window.orientation !== "undefined") {
            this.eulerOrigin.set(
                90 * this.RAD, 
                180 * this.RAD, 
                (180 + window.orientation) * this.RAD
            );
        }
    }

    ////////////////////////////////////// PRIVATE METHODS //////////////////////////////////////
    // (experimental)
    recalibrateYPR() {
        this.axisUp.set(0, 1, 0);
        this.axisFwd.set(0, 0, 1);
        this.axisUp.applyQuaternion(this.sensorRotations.quaternion);
        this.axisFwd.applyQuaternion(this.sensorRotations.quaternion);
    }

    // Recalibrates axes to be oriented to current this.data rotations
    performRecalibration() {
        this.sensorRotations.setRotationFromEuler(this.eulerOrigin);

        // Apply gyroscope rotations
        this.sensorRotations.rotateZ(this.data.alpha * this.RAD);
        this.sensorRotations.rotateX(this.data.beta * this.RAD);
        this.sensorRotations.rotateY(this.data.gamma * this.RAD);
        this.sensorRotations.rotation.z -= this.data.orientation;

        this.quatOrigin.copy(this.sensorRotations.quaternion);
        this.quatOrigin.inverse();

        this.recalRequested = false;
    }

    // When switching from portrait <-> landscape
    onDeviceReorientation() {
        this.data.orientation = (window.orientation * this.RAD) || 0;
    }

    // Update data when device detects movement
    // Alpha = z axis [0 ,360]
    // Beta = x axis [-180 , 180]
    // Gamma = y axis [-90 , 90]
    onSensorMove(event) {
        this.data.alpha = event.alpha;
        this.data.beta = event.beta;
        this.data.gamma = event.gamma;
        this.needsUpdate = true;

        if (this.recalRequested) {
            this.performRecalibration();
        }
    }

    ////////////////////////////////////// PUBLIC METHODS  //////////////////////////////////////
    // Enables gimbal
    enable() {
        this.onDeviceReorientation();

        window.addEventListener("deviceorientation", this.onSensorMove.bind(this), false);
        window.addEventListener("orientationchange", this.onDeviceReorientation.bind(this), false);
    }

    // Disables gimbal
    disable() {
        window.removeEventListener("deviceorientation", this.onSensorMove.bind(this), false);
        window.removeEventListener("orientationchange", this.onDeviceReorientation.bind(this), false);
    }

    // Will perform recalibration when this.data is available
    recalibrate() {
        this.recalRequested = true;
    }

    // Called once per frame
    update() {
        // Skips calculations if this.data hasn't changed
        if (this.needsUpdate === false) {
            return;
        }

        // Reset rotation
        this.sensorRotations.setRotationFromEuler(this.eulerOrigin);
        this.sensorRotations.applyQuaternion(this.quatOrigin);

        // Apply gyroscope rotations
        this.sensorRotations.rotateZ(this.data.alpha * this.RAD);
        this.sensorRotations.rotateX(this.data.beta * this.RAD);
        this.sensorRotations.rotateY(this.data.gamma * this.RAD);
        this.sensorRotations.rotation.z -= this.data.orientation;

        // Extract quaternion from object
        this.quaternion.copy(this.sensorRotations.quaternion);
        this.quaternion.inverse();

        // Apply quat to axes
        this.vectorUp.copy(this.axisUp);
        this.vectorUp.applyQuaternion(this.quaternion);
        this.vectorFwd.copy(this.axisFwd);
        this.vectorFwd.applyQuaternion(this.quaternion);

        // Yaw is heading east (-) or west (+) rotation around y-axis.
        this.yaw = Math.atan2(this.vectorFwd.x, this.vectorFwd.z);

        // Pitch is pointing above or below (+/-) horizon line
        this.pitch = Math.atan2(this.vectorUp.z, this.vectorUp.y);

        // Roll is left (-) or right (+) rotation around local z-axis
        this.roll = Math.atan2(-this.vectorUp.x, this.vectorUp.y);

        this.needsUpdate = false;
    }
}
