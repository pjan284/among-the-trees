function Demo()
{
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    //this.renderer.shadowMapCascade = true;
    this.renderer.sortObjects = false;
    this.renderer.autoUpdateObjects = false;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true; // when scene changes

    document.body.appendChild( this.renderer.domElement );

    this.ground = new Ground(this.scene);
    this.forest = new Forest(this.scene, this.ground);
    this.player = new Player(this.scene, this.ground);
    this.input = new Input(this.player);

    this.directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    this.directionalLight.position.set( 0, 100, 0 );

    var obj = new THREE.Object3D();
    obj.position.set(0, 0, 0);

    this.directionalLight.target = obj;

    this.directionalLight.castShadow = true;
    this.directionalLight.shadowMapWidth = 2048;
    this.directionalLight.shadowMapHeight = 2048;
    this.directionalLight.shadowCameraNear = 5;
    this.directionalLight.shadowCameraFar = 300;
    this.directionalLight.shadowCameraLeft = -this.ground.wh;
    this.directionalLight.shadowCameraRight = 0;
    this.directionalLight.shadowCameraTop = 0;
    this.directionalLight.shadowCameraBottom = -this.ground.wh;
    this.directionalLight.onlyShadow = true;
    //this.directionalLight.shadowCameraVisible = true;

    this.scene.add( this.directionalLight );

    this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(this.ambientLight);

    this.input.attachKeyDown();
    this.input.attachKeyUp();

    this.lastTime = 0;
}

Demo.prototype.render = function()
{ 
    this.renderer.render(this.scene, this.player.camera);
}

Demo.prototype.animate = function()
{
    var timeNow = new Date().getTime();
    if (this.lastTime != 0)
    {
        var elapsed = timeNow - this.lastTime;

        this.input.handleKeys();
        this.player.animate(elapsed);
        this.forest.animate(elapsed);
    }
    this.lastTime = timeNow;
}
