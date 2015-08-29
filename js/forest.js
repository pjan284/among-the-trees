function Forest(scene, ground)
{
    this.treesInARow = 6;
    this.trees = [];
    this.models = TreeModels();

    var treeTexture = THREE.ImageUtils.loadTexture("img/wood.jpg");
    treeTexture.wrapS = THREE.RepeatWrapping;
    treeTexture.wrapT = THREE.RepeatWrapping;
    //this.treeMaterial = new THREE.MeshLambertMaterial({ map:treeTexture });
    this.treeMaterial = new THREE.MeshPhongMaterial({ map:treeTexture });
    this.treeMaterial.shininess = 1;

    var space = ground.wh/this.treesInARow;

    for(var i=0; i<this.treesInARow; i++)
    {
        for(var j=0; j<this.treesInARow; j++)
        {
            var model = Math.floor(Math.random() * this.models.length);
            var mesh = new THREE.Mesh( this.models[model].geometry, this.treeMaterial );
            var x = i*space + utils.random(0, space);
            var z = j*space + utils.random(0, space);
            mesh.position.set(x, ground.getHeight(x, z), z);
            mesh.castShadow = true;
            scene.add( mesh );
            this.trees.push(mesh);
        }
    }
}

Forest.prototype.animate = function(deltaTime)
{
}
