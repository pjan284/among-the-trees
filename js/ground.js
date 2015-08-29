function Ground(scene)
{
    this.size = Math.pow(2, 6);

    this.wh = 50.0;
    this.whTex = 10.0;

    this.mulXZ = this.wh/this.size;
    this.mulY = 10.0;

    this.values = new Array(this.size);
    for(var i=0; i<this.size; i++)
    {
        this.values[i] = new Array(this.size);
        for (var j=0; j<this.size; j+=1)
        {
            this.values[i][j] = 0.0;
        }
    }

    this.diamondSquare();
    this.normalize();
    this.initGeometry();

    var texture = THREE.ImageUtils.loadTexture("img/grass.jpg", THREE.UVMapping);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    //this.material = new THREE.MeshLambertMaterial({ map:texture });
    this.material = new THREE.MeshPhongMaterial({ map:texture });
    this.material.shininess = 1;

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.mesh.receiveShadow = true;

    scene.add( this.mesh );
}

Ground.prototype.initGeometry = function()
{
    var geometry = new THREE.Geometry();

    for (var i=0; i<=this.size; i++)
    {
        for (var j=0; j<=this.size; j++)
        {
            geometry.vertices.push( new THREE.Vector3( i * this.mulXZ ,
                                                       this.values[i%this.size][j%this.size] * this.mulY,
                                                       j * this.mulXZ ) );
        }
    }

    var m = this.size+1;

    for (var i=0; i<this.size; i++)
    {
        for (var j=0; j<this.size; j++)
        {
            var fa = j*m + i;
            var fb = j*m + (i+1);
            var fc = (j+1)*m + i;
            var fd = (j+1)*m + (i+1);
            geometry.faces.push( new THREE.Face3(fa, fb, fc) );
            geometry.faces.push( new THREE.Face3(fc, fb, fd) );

            var uva = new THREE.Vector2(  (i    / this.size) * this.whTex, ( j    / this.size) * this.whTex );
            var uvb = new THREE.Vector2(  (i    / this.size) * this.whTex, ((j+1) / this.size) * this.whTex );
            var uvc = new THREE.Vector2( ((i+1) / this.size) * this.whTex, ( j    / this.size) * this.whTex );
            var uvd = new THREE.Vector2( ((i+1) / this.size) * this.whTex, ((j+1) / this.size) * this.whTex );

            geometry.faceVertexUvs[ 0 ].push( [ uva, uvc, uvb ] );

            geometry.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc.clone(), uvd ] );
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );
}

Ground.prototype.getHeight = function(x, y)
{
    x /= this.mulXZ;
    y /= this.mulXZ;

    if(x < 0 || x > this.size)
        return 0.0;
    if(y < 0 || y > this.size)
        return 0.0;
    var x0 = Math.floor(x);
    var y0 = Math.floor(y);
    var x1 = x0 + 1;
    var y1 = y0 + 1;

    if(x0 >= this.size)
        x0 = 0;
    if(y0 >= this.size)
        y0 = 0;

    if(x1 >= this.size)
        x1 = 0;
    if(y1 >= this.size)
        y1 = 0;

    var h00 = this.values[x0][y0];
    var h01 = this.values[x1][y0];
    var h10 = this.values[x0][y1];
    var h11 = this.values[x1][y1];

    var tx = x - x0;
    var ty = y - y0;

    var txty = tx * ty;
    return ( h00 * (1.0 - ty - tx + txty) +
             h01 * (tx - txty) +
             h10 * (ty - txty) +
             h11 * txty ) * this.mulY;
}

/**
 * Based on the algorithm from "OpenGL Game Programming" by Kevin Hawkins and Dave Astle
 */
Ground.prototype.diamondSquare = function()
{
    var size = this.size;

    while(size > 0)
    {
        // Diamond
        for (var x=0; x<this.size; x+=size)
        {
            for (var y=0; y<this.size; y+=size)
            {
                var next_x = Math.floor(x + size) % this.size;
                var next_y = Math.floor(y + size) % this.size;

                var mid_x = Math.floor(x + size/2);
                var mid_y = Math.floor(y + size/2);

                this.values[mid_x][mid_y] = ( this.values[x][y] +
                                              this.values[next_x][y] +
                                              this.values[x][next_y] +
                                              this.values[next_x][next_y] ) / 4 + utils.random(-size, size);
            }
        }

        // Square
        for (var x=0; x<this.size; x+=size)
        {
            for (var y=0; y<this.size; y+=size)
            {
                var next_x = Math.floor(x + size) % this.size;
                var next_y = Math.floor(y + size) % this.size;

                var mid_x = Math.floor(x + size/2);
                var mid_y = Math.floor(y + size/2);

                var prev_mid_x = Math.floor(x - size/2 + this.size) % this.size;
                var prev_mid_y = Math.floor(y - size/2 + this.size) % this.size;

                this.values[mid_x][y] = ( this.values[x][y] +
                                          this.values[next_x][y] +
                                          this.values[mid_x][prev_mid_y] +
                                          this.values[mid_x][mid_y] ) / 4 + utils.random(-size, size);

                this.values[x][mid_y] = ( this.values[x][y] +
                                          this.values[x][next_y] +
                                          this.values[prev_mid_x][mid_y] +
                                          this.values[mid_x][mid_y] ) / 4 + utils.random(-size, size);
            }
        }

        size = Math.floor(size / 2);
    }
}

Ground.prototype.normalize = function()
{
    var max, min;
    max = min = this.values[0][0];

    for (var i=0; i<this.size; i++)
    {
        for (var j=0; j<this.size; j++)
        {
            if (this.values[i][j] > max)
            {
                max = this.values[i][j];
            }
            else if (this.values[i][j] < min)
            {
                min = this.values[i][j];
            }
        }
    }

    var dh = max - min;
    if(dh == 0.0)
        return

    for (var i=0; i<this.size; i++)
    {
        for (var j=0; j<this.size; j++)
        {
            this.values[i][j] = (this.values[i][j]-min)/dh;
        }
    }
}
