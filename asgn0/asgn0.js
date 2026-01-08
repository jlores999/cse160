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
  var v = new Vector3([1,2,0]);
  drawVector(v,"red");
  //Draw a blue rectangle
 // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  //ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
}




