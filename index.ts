import GimbalScene from "./GimbalScene";

// Scene vars
var scene: GimbalScene;

///////////////////////////// SCENE SETUP /////////////////////////////
function initApp(){
    scene = new GimbalScene();
    render(0);
}

function render(t: number): void{
    scene.update(t * 0.001);
    requestAnimationFrame(render);
}

initApp();