// DrawTriangle.js (c) 2012 matsuda
let ctx;

function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(v.elements[0]*20, v.elements[1]*20);
  ctx.strokeStyle = color;
  ctx.stroke();
}
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');
  var v = new Vector3([2.5,2.5,0]);
  drawVector(v,"red");
}





