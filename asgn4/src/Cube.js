class Cube {
  static vertexBuffer = null;
  static uvBuffer = null;
  static normalBuffer = null;
  static initialized = false;
  
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
    
    if (!Cube.initialized) {
      Cube.initBuffers();
      Cube.initialized = true;
    }
  }
  
  static initBuffers() {
    const vertices = new Float32Array([
      // Front face
      0,0,0,  1,1,0,  1,0,0,
      0,0,0,  0,1,0,  1,1,0,
      // Top face
      0,1,0,  0,1,1,  1,1,1,
      0,1,0,  1,1,1,  1,1,0,
      // Right face
      1,1,0,  1,1,1,  1,0,0,
      1,0,0,  1,1,1,  1,0,1,
      // Back face
      0,1,1,  1,1,1,  1,0,1,
      0,0,1,  0,1,1,  1,0,1,
      // Left face
      0,0,0,  0,0,1,  0,1,1,
      0,0,0,  0,1,0,  0,1,1,
      // Bottom face
      0,0,0,  0,0,1,  1,0,1,
      0,0,0,  1,0,0,  1,0,1
    ]);
    
    const uvs = new Float32Array([
      // Front
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // Top
      0,0, 0,1, 1,1,
      0,0, 1,1, 1,0,
      // Right
      0,1, 1,1, 0,0,
      0,0, 1,1, 1,0,
      // Back
      0,1, 1,1, 1,0,
      0,0, 0,1, 1,0,
      // Left
      0,0, 1,0, 1,1,
      0,0, 0,1, 1,1,
      // Bottom
      0,0, 0,1, 1,1,
      0,0, 1,0, 1,1
    ]);

    const normals = new Float32Array([
      // Front face (facing -Z)
      0,0,-1,  0,0,-1,  0,0,-1,
      0,0,-1,  0,0,-1,  0,0,-1,
      // Top face (facing +Y)
      0,1,0,  0,1,0,  0,1,0,
      0,1,0,  0,1,0,  0,1,0,
      // Right face (facing +X)
      1,0,0,  1,0,0,  1,0,0,
      1,0,0,  1,0,0,  1,0,0,
      // Back face (facing +Z)
      0,0,1,  0,0,1,  0,0,1,
      0,0,1,  0,0,1,  0,0,1,
      // Left face (facing -X)
      -1,0,0,  -1,0,0,  -1,0,0,
      -1,0,0,  -1,0,0,  -1,0,0,
      // Bottom face (facing -Y)
      0,-1,0,  0,-1,0,  0,-1,0,
      0,-1,0,  0,-1,0,  0,-1,0
  ]);
    
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  }
  
  render(){
    var rgba = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    // Bind UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    //Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
    
    // Front face 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    // Top face 
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    
    // Right + Back faces
      gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 12, 12);
    
    // Left + Bottom faces 
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 24, 12);
  }
}