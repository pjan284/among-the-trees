/**
 * Algorithm and values from "The Algorithmic Beauty of Plants" by Przemyslaw Prusinkiewicz and Aristid Lindenmayer
 */

function TreeModels()
{
    var models = [];
    models.push(new TreeGeometry( 94.74,
                                  132.63,
                                  18.95,
                                  1.109,
                                  1.932,
                                  1.0,
                                  0.02,
                                  5,
                                  6 ));

    models.push(new TreeGeometry( 137.5,
                                  137.5,
                                  25.95,
                                  1.009,
                                  1.732,
                                  1.0,
                                  0.02,
                                  5,
                                  6 ));

    models.push(new TreeGeometry( 112.5,
                                  157.5,
                                  22.5,
                                  1.009,
                                  1.732,
                                  1.0,
                                  0.02,
                                  5,
                                  6 ));

    models.push(new TreeGeometry( 180.0,
                                  252.0,
                                  36.0,
                                  1.007,
                                  1.9,
                                  1.0,
                                  0.02,
                                  5,
                                  6 ));



    return models;
}

function TreeGeometry( divergenceAngle1,
                       divergenceAngle2,
                       branchingAngle,
                       elongationRate,
                       thickenningRate,
                       defLen,
                       defRadius,
                       maxIter,
                       radialSegments )
{
    this.treeLSystem = new TreeLSystem( divergenceAngle1,
                                        divergenceAngle2,
                                        branchingAngle,
                                        elongationRate,
                                        thickenningRate,
                                        defLen,
                                        defRadius,
                                        maxIter );

    var radial = radialSegments;
    var geometry = new THREE.Geometry();
    var verticesNum = 0;

    this.treeLSystem.root.traverse( function(node) {
        if(node.parent != null)
        {
            var branchDirection = vec3.create();
            vec3.direction(node.parent.position, node.position, branchDirection);
            var r = vec3.create([node.radius, 0.0, 0.0]);
            var n = vec3.create([1.0, 0.0, 0.0]);

            var v = vec3.create();
            vec3.subtract(node.position, node.parent.position, v);
            var texHeight = vec3.length(v)/(node.radius*6.28);

            node.firstIndex = verticesNum;

            for(var i=0; i<radial; i+=1)
            {
                var matrix = mat4.create();
                mat4.identity(matrix);
                mat4.rotate(matrix, utils.degToRad(i*360.0/radial), branchDirection);
                var p = vec3.create();
                mat4.multiplyVec3(matrix, r, p);
                var nn = vec3.create();
                mat4.multiplyVec3(matrix, n, nn);
                geometry.vertices.push( new THREE.Vector3( node.position[0] + p[0],
                                                           node.position[1] + p[1],
                                                           node.position[2] + p[2]) );

                geometry.faces.push( new THREE.Face3( node.parent.firstIndex + i,
                                                      node.firstIndex + i,
                                                      node.parent.firstIndex + (i+1)%radial) );

                geometry.faces.push( new THREE.Face3( node.parent.firstIndex + (i+1)%radial,
                                                      node.firstIndex + i,
                                                      node.firstIndex + (i+1)%radial) );

                var uva = new THREE.Vector2(  i    * (1/radial), node.parent.texOffset );
                var uvb = new THREE.Vector2( (i+1) * (1/radial), node.parent.texOffset );
                var uvc = new THREE.Vector2(  i    * (1/radial), node.parent.texOffset + texHeight );
                var uvd = new THREE.Vector2( (i+1) * (1/radial), node.parent.texOffset + texHeight );

                geometry.faceVertexUvs[ 0 ].push( [ uva, uvc, uvb ] );
                geometry.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc.clone(), uvd ] );
            }


            verticesNum += radial;

            node.texOffset = node.parent.texOffset + texHeight;
            node.texOffset -= Math.floor(node.texOffset);
        }else{
            for(var i=0; i<radial; i+=1)
            {
                var x = Math.cos(utils.degToRad(i*360.0 / radial));
                var z = Math.sin(utils.degToRad(i*360.0 / radial));
                geometry.vertices.push( new THREE.Vector3( node.position[0] + node.radius*x,
                                                           node.position[1],
                                                           node.position[2] + node.radius*z ) );
            }

            verticesNum += radial;
            node.firstIndex = 0;
            node.texOffset = 0.0;
        }
    } );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );
}



function TreeNode(position, radius)
{
    this.parent = null;
    this.position = position;
    this.radius = radius;
    this.children = [];
}

TreeNode.prototype.addChild = function(node)
{
    this.children.push(node);
    node.parent = this;
}

TreeNode.prototype.traverse = function(action)
{
    action(this);
    for(var i=0; i<this.children.length; i++)
    {
        this.children[i].traverse(action);
    }
}



function TreeLSystem(divergenceAngle1, divergenceAngle2, branchingAngle, elongationRate, thickenningRate, defLen, defRadius, maxIter)
{
    this.divergenceAngle1 = divergenceAngle1;
    this.divergenceAngle2 = divergenceAngle2;
    this.branchingAngle = branchingAngle;
    this.elongationRate = elongationRate;
    this.thickenningRate = thickenningRate;
    this.defLen = defLen;
    this.defRadius = defRadius;

    this.maxIter = maxIter;

    this.matrix = new MatrixStack();
    mat4.identity(this.matrix.top);

    this.root = new TreeNode([0, 0, 0], this.radius(0));

    //Trunk
    var newNode = new TreeNode(this.F(this.len(0)*3), this.radius(0));
    this.root.addChild(newNode);

    this.A(0, newNode);
}

TreeLSystem.prototype.len = function(numIter)
{
    var l = this.defLen;
    while(numIter < this.maxIter)
    {
        l *= this.elongationRate;
        numIter++;
    }
    return l
}

TreeLSystem.prototype.radius = function(numIter)
{
    var r = this.defRadius;
    while(numIter < this.maxIter)
    {
        r *= this.thickenningRate;
        numIter++;
    }
    return r
}

TreeLSystem.prototype.F = function(len)
{
    var zeroVec=[0.0, 0.0, 0.0];
    var nextPointPos=vec3.create();
    mat4.translate(this.matrix.top, [0.0, len, 0.0] );

    mat4.multiplyVec3(this.matrix.top, zeroVec, nextPointPos);

    return nextPointPos;
}

TreeLSystem.prototype.X = function(angle)
{
    mat4.rotate(this.matrix.top, utils.degToRad(angle), [1, 0, 0]);
}

TreeLSystem.prototype.Y = function(angle)
{
    mat4.rotate(this.matrix.top, utils.degToRad(angle), [0, 1, 0]);
}

TreeLSystem.prototype.A = function(numIter, node)
{
    if(numIter >= this.maxIter)
    {
        return;
    }

    var node1 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter));
    node.addChild(node1);

    this.matrix.push();
    this.X(this.branchingAngle);
    var node2 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter+1));
    node1.addChild(node2);
    this.A(numIter+1, node2);
    this.matrix.pop();

    this.Y(this.divergenceAngle1);

    this.matrix.push();
    this.X(this.branchingAngle);
    var node3 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter+1));
    node1.addChild(node3);
    this.A(numIter+1, node3);
    this.matrix.pop();

    this.Y(this.divergenceAngle2);

    this.matrix.push();
    this.X(this.branchingAngle);
    var node4 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter+1));
    node1.addChild(node4);
    this.A(numIter+1, node4);
    this.matrix.pop();
}