function Player(scene, ground)
{
    this.h = 2;
    this.pos = vec3.create([0, 0, 0]);
    this.lookAt = vec3.create([0, 0, 0]);

    this.yaw = 0.0;
    this.pitch = 0.0;

    this.speed = 0.0;
    this.maxSpeed = 5.0;

    this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 300 );

    this.ground = ground;

    this.pos.set([ground.wh/2.0, 0.0, ground.wh/2.0]);

    this.camera.up = new THREE.Vector3(0,1,0);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    this.updateCameraPos();

    this.spotLight = new THREE.SpotLight( 0xffffff );
    this.spotLight.position.set( 0, 0, 100 );

    this.spotLight.distance = 100;
    this.spotLight.angle = Math.PI/6;
    this.spotLight.exponent = 50.0;
    //this.spotLight.castShadow = true;
    this.spotLight.shadowCameraNear = 3;
    this.spotLight.shadowCameraFar = 50;
    this.spotLight.shadowCameraLeft = -20
    this.spotLight.shadowCameraRight = 20;
    this.spotLight.shadowCameraTop = 20;
    this.spotLight.shadowCameraBottom = -20;
    //this.spotLight.shadowCameraFov = 3;
    this.spotLight.shadowCameraVisible = true;

    scene.add(this.camera);


    this.camera.add(this.spotLight);
    this.spotLight.position.set(0,0,1);
    this.spotLight.target = this.camera;
}

Player.prototype.updateCameraPos = function()
{
    this.camera.position.set(this.pos[0], this.pos[1], this.pos[2]);
    this.camera.lookAt(new THREE.Vector3(this.lookAt[0], this.lookAt[1], this.lookAt[2]));
    this.camera.updateProjectionMatrix();
}

Player.prototype.animate = function(deltaTime)
{
    if(this.yaw<=-360.0 || this.yaw>=360.0)
    {
        this.yaw=0.0;
    }

    if(this.pitch>89.0)
    {
        this.pitch=89.0;
    }

    if(this.pitch<-89.0)
    {
        this.pitch=-89.0;
    }

    var cosYaw = Math.cos(utils.degToRad(this.yaw));
    var sinYaw = Math.sin(utils.degToRad(this.yaw));
    var sinPitch = Math.sin(utils.degToRad(this.pitch));
    var cosPitch = Math.cos(utils.degToRad(this.pitch));

    if(this.speed != 0.0)
    {
        this.speed *= 0.8;
    }

    if (this.speed > this.maxSpeed)
        this.speed = this.maxSpeed;
    if (this.speed < -this.maxSpeed)
        this.speed = -this.maxSpeed;

    var s = this.speed * deltaTime;

    this.pos[0] += sinYaw * s;
    this.pos[2] += cosYaw * s;

    if(this.pos[0] < 0.0){
        this.pos[0] = 0.0;
    }

    if(this.pos[2] < 0.0){
        this.pos[2] = 0.0;
    }

    if(this.pos[0] > this.ground.wh){
        this.pos[0] = this.ground.wh;
    }

    if(this.pos[2] > this.ground.wh){
        this.pos[2] = this.ground.wh;
    }

    this.pos[1] = this.ground.getHeight(this.pos[0], this.pos[2]) + this.h;

    this.lookAt[0] = this.pos[0] - (sinYaw * cosPitch);
    this.lookAt[1] = this.pos[1] - sinPitch;
    this.lookAt[2] = this.pos[2] - (cosYaw * cosPitch);

    this.updateCameraPos();
}

Player.prototype.accelerete = function(deltav)
{
    this.speed -= deltav;
}

Player.prototype.changePitch = function(deltaPitch)
{
    this.pitch -= deltaPitch;
}

Player.prototype.changeYaw = function(deltaYaw)
{
    this.yaw -= deltaYaw;
}