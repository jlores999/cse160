class Cube{
  constructor(){
    this.type='cube'
    this.color = [1.0, 1.0, 1.0, 1.0];
    //this.position = [0.0, 0.0, 0.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
  }

  render(){
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
    drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
    drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);
    //fake lighting
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*9, rgba[3]);

    drawTriangle3D([0,1,0,  0,1,1,   1,1,1]);
    drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

    }

  }