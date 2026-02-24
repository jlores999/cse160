class Sphere {
  static vertexBuffer = null;
  static uvBuffer = null;
  static normalBuffer = null;
  static numVertices = 0;
  static initialized = false;
  
  constructor(){
    this.type = 'sphere';
    this.color = [1.0,1.0,1.0,1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
    
    if (!Sphere.initialized) {
      Sphere.initBuffers();
      Sphere.initialized = true;
    }
  }
  
  static initBuffers() {
    let vertices = [];
    let uvs = [];
    let normals = [];
    
    var d = Math.PI/10;
    var dd = Math.PI/10;
    
    for (var t = 0; t < Math.PI; t+=d){
      for (var r = 0; r < (2*Math.PI); r+=d){
        var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
        var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
        var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
        var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];
        
        // First triangle
        vertices.push(...p1, ...p2, ...p4);//change this p1[0]...p4[3]
        normals.push(...p1, ...p2, ...p4);  // For sphere, normal = position
        //uvs.push(0,0, 0,0, 0,0);
              uvs.push(r/(2*Math.PI), t/Math.PI,  r/(2*Math.PI), (t+dd)/Math.PI,  (r+dd)/(2*Math.PI), (t+dd)/Math.PI);
        // Second triangle
        vertices.push(...p1, ...p4, ...p3);
        normals.push(...p1, ...p4, ...p3);
        //uvs.push(0,0, 0,0, 0,0);
              uvs.push(r/(2*Math.PI), t/Math.PI,  (r+dd)/(2*Math.PI), (t+dd)/Math.PI,  (r+dd)/(2*Math.PI), t/Math.PI);
      }
    }
    
    this.numVertices = vertices.length / 3;
    
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  }
  
  render(){
    var rgba = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    // Bind UV buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    
    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
    
    gl.drawArrays(gl.TRIANGLES, 0, Sphere.numVertices);
  }
}