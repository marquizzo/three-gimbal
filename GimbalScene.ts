import Gimbal from "../utils/gimbal";

export default class GimbalScene{
    readonly DEG: number = 180 / Math.PI;

    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    cam: THREE.OrthographicCamera;

    gimbal: Gimbal;

    arrowHeading: THREE.Mesh;
    arrowAttack: THREE.Mesh;
    arrowRoll: THREE.Mesh;
    arrowAll: THREE.Mesh;

    divHeading: HTMLElement;
    divAttack: HTMLElement;
    divRoll: HTMLElement;

    vpW: number;
    vpH: number;
    ratio: number;

    constructor(){
        this.scene = new THREE.Scene();
        this.cam = new THREE.OrthographicCamera(-10, 10, 10, -10, -10, 10);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        document.getElementById("pageMain").appendChild(this.renderer.domElement);
        this.onWindowResize(null);

        this.divHeading = document.getElementById("divHeading");
        this.divAttack = document.getElementById("divAttack");
        this.divRoll = document.getElementById("divRoll");

        this.gimbal = new Gimbal();
        this.gimbal.enable();

        this.buildArrows();

        window.addEventListener("resize", this.onWindowResize.bind(this), false);
    }

    private makeArrowMesh(color: number): THREE.Mesh{
        let shape = new THREE.Shape();
        shape.moveTo(1, -2);
        shape.lineTo(1, 0);
        shape.lineTo(2, 0);
        shape.lineTo(0, 2);
        shape.lineTo(-2, 0);
        shape.lineTo(-1, 0);
        shape.lineTo(-1, -2);
        shape.lineTo(1, -2);

        let extrudeSettings = {
            steps: 1,
            amount: 1,
            bevelEnabled: false
        }

        let arrowGeom: THREE.BufferGeometry = new (<any>THREE).ExtrudeBufferGeometry(shape, extrudeSettings);

        return new THREE.Mesh(arrowGeom, new THREE.MeshLambertMaterial({color}));
    }

    private buildArrows(): void{
        let light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(-0.5, 1, 1);
        this.scene.add(light);

        let ambLight = new THREE.DirectionalLight(0xffffff, 0.3);
        ambLight.position.set(0.5, -1, 1);
        this.scene.add(ambLight);

        let dir = new THREE.Vector3(0, 0, -1);
        let pos = new THREE.Vector3();

        this.arrowHeading = this.makeArrowMesh(0xff0099);
        this.arrowHeading.position.set(-5, 5, 0);
        this.arrowAttack = this.makeArrowMesh(0x99ff00);
        this.arrowAttack.position.set(5, 5, 0);
        this.arrowRoll = this.makeArrowMesh(0x0099ff);
        this.arrowRoll.position.set(-5, -5, 0);
        this.arrowAll = this.makeArrowMesh(0xff9900);
        this.arrowAll.position.set(5, -5, 0);

        this.scene.add(this.arrowHeading);
        this.scene.add(this.arrowAttack);
        this.scene.add(this.arrowRoll);
        this.scene.add(this.arrowAll);
    }

    private onWindowResize(evt: Event): void{
        this.vpW = window.innerWidth;
        this.vpH = window.innerHeight;
        this.ratio = this.vpW / this.vpH;

        this.cam.left = -this.ratio * 10;
        this.cam.right = this.ratio * 10;
        this.cam.updateProjectionMatrix();

        this.renderer.setSize(this.vpW, this.vpH);
    }

    //////////////////////////////////////////// UPDATE /////////////////////////////////////////////
    public update(t: number): void{
        let time = t;

        this.gimbal.update();

        this.arrowHeading.rotation.y = this.gimbal.yaw;
        this.divHeading.innerHTML = (this.gimbal.yaw * this.DEG).toFixed(2) + "°";

        this.arrowAttack.rotation.x = this.gimbal.pitch;
        this.divAttack.innerHTML = (this.gimbal.pitch * this.DEG).toFixed(2) + "°";
        
        this.arrowRoll.rotation.z = this.gimbal.roll;
        this.divRoll.innerHTML = (this.gimbal.roll * this.DEG).toFixed(2) + "°";
        
        this.arrowAll.quaternion.copy(this.gimbal.quaternion);


        this.renderer.render(this.scene, this.cam);
    }
}