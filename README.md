# three-gimbal
A Three.js utility that separates your device's orientation into individual yaw, pitch, and roll rotations without gimbal-lock.

[![](https://github.com/marquizzo/three-gimbal/blob/master/yaw-pitch-roll.png)]()
[Image by Wikipedia user ZeroOne](https://en.wikipedia.org/wiki/Aircraft_principal_axes#/media/File:Flight_dynamics_with_text.png)

---
### How it works:
This utility uses the `deviceorientation` event that's available in most mobile devices. When its sensor detects a change in orientation, it calculates new rotation parameters:
- **Yaw** is the rotation along the Y-axis
- **Pitch** is the rotation along the X-axis
- **Roll** is the rotation along the Z-axis.

---
### Examples
- [Video of how it works](https://twitter.com/marquizzo/status/953356438184718337). You can see that each rotation is independent of the other.
- [Live demo](http://dyadstudios.com/code/gimbal/). Visit this page with your mobile device to see it in action.
---
### Usage
1. Import Gimbal.js in whatever method you prefer.
2. iOS Safari 14.5 and up requires user permission (and https) to get access to gyroscope data

```javascript
var gimbal = new Gimbal();

// Gimbal access can only be requested upon user interaction
// and only via https connections
function onButtonClick() {
	DeviceMotionEvent.requestPermission().then(response => {
		if (response == 'granted') {
			// Now we can enable the gimbal!
		    gimbal.enable();
		}
	});
}

// Stops listening to device orientation changes
gimbal.disable();

// Recalibrates gimbal axes
// so current phone orientation is the rotational origin
gimbal.recalibrate();

// Render loop
function render() {
    // Performs all necessary calculations
    gimbal.update();

    // Gets yaw rotation (y-axis)
    // Range [-180, 180], 0 is forward
    gimbal.yaw;

    // Gets pitch rotation (x-axis)
    // Range [-180, 180], 0 is horizontal
    gimbal.pitch;

    // Gets roll rotation (z-axis)
    // Range [-180, 180], 0 is vertical
    gimbal.roll;

    requestAnimationFrame(render);    
}

```

##### iOS warning:
iOS 14.5 and later will have gyroscope input disabled by default. We must now request access to the gyroscope data upon user click, as demonstrated in the code above. Additionally, your website will need to be served via the `https` protocol.

For more information [Read this discussion in the Three.js forum](https://discourse.threejs.org/t/iphone-ios-12-2-will-disable-gyroscope-access-by-default/6579). 
