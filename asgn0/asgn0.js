// DrawTriangle.js (c) 2012 matsuda
let ctx;
let canvas;

function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(v.elements[0]*20, v.elements[1]*20);
  ctx.strokeStyle = color;
  ctx.stroke();
}
function handleDraw() {
  // Reset transform so clearing works correctly
  ctx.save(); // save current transform
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to default
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears entire canvas
  ctx.restore(); // restore the translate/scale transform
  const x1 = document.getElementById("x1").value;
  const y1 = document.getElementById("y1").value;
  const x2 = document.getElementById("x2").value;
  const y2 = document.getElementById("y2").value;
  var numX1 = Number(x1);
  var numY1 = Number(y1);
  var numX2 = Number(x2);
  var numY2 = Number(y2);
  if (isNaN(numX1) || isNaN(numY1) || isNaN(numX2) || isNaN(numY2)){
    alert("Enter a valid input");
    return;
  }
  var v1 = new Vector3([numX1, numY1, 0]);
  var v2 = new Vector3([numX2, numY2, 0]);

  drawVector(v1,"red");
  drawVector(v2, "blue");
}
function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');
  ctx.translate(canvas.width/2, canvas.height/2);
  //var v = new Vector3([2.5,2.5,0]);
  //drawVector(v,"red");
}










