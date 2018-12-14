# three-gimbal
A Three.js utility that separates your device's orientation into individual yaw, pitch, and roll rotations without gimbal-lock.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Flight_dynamics_with_text.png/1280px-Flight_dynamics_with_text.png)]()
[Image by Wikipedia user ZeroOne](https://en.wikipedia.org/wiki/Aircraft_principal_axes#/media/File:Flight_dynamics_with_text.png)

### How it works:
This utility uses the `deviceorientation` event that's available in most mobile devices. When its sensor detects a change in orientation, it calculates new rotation parameters:
- **Yaw** is the rotation along the Y-axis
- **Pitch** is the rotation along the X-axis
- **Roll** is the rotation along the Z-axis.


### Examples
- [Video of how it works](https://twitter.com/marquizzo/status/953356438184718337). You can see that each rotation is independent of the other.
- [Live demo](http://dyadstudios.com/code/gimbal/). Visit this page with your mobile device to see it in action.

### Usage
*Coming Soon*
