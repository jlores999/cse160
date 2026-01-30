class Cone {
  constructor() {
    this.type = 'cone';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 20; // Number of segments around the base circle
  }
  
  render() {
    var rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    var apex = [0.5, 1, 0.5]; // Top point of the cone
    var baseCenter = [0.5, 0, 0.5]; // Center of the base
    var radius = 0.5;
    
    // Draw the sides of the cone
    for (var i = 0; i < this.segments; i++) {
      var angle1 = (i / this.segments) * 2 * Math.PI;
      var angle2 = ((i + 1) / this.segments) * 2 * Math.PI;
      
      var x1 = baseCenter[0] + radius * Math.cos(angle1);
      var z1 = baseCenter[2] + radius * Math.sin(angle1);
      var x2 = baseCenter[0] + radius * Math.cos(angle2);
      var z2 = baseCenter[2] + radius * Math.sin(angle2);
      
      // Forms the triangle-like shape of cone
      drawTriangle3D([
        apex[0], apex[1], apex[2],
        x1, baseCenter[1], z1,
        x2, baseCenter[1], z2
      ]);
      
      //fills bottom of cone
      drawTriangle3D([
        baseCenter[0], baseCenter[1], baseCenter[2],
        x2, baseCenter[1], z2,
        x1, baseCenter[1], z1
      ]);
    }
  }
}