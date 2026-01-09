// DrawTriangle.js (c) 2012 matsuda
let ctx;

function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(v.elements[0]*20, v.elements[1]*20);
  ctx.strokeStyle = color;
  ctx.stroke();
}
function handleDraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const x = document.getElementById("x").value;
  const y = document.getElementById("y").value;
  var numX = Number(x);
  var numY = Number(y);
  if (isNaN(numX) || isNaN(numY){
    alert("Enter a valid input");
    return;
  }
  var v = new Vector3([numX, numY, 0]);
  drawVector(v,"red");
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
  //var v = new Vector3([2.5,2.5,0]);
  //drawVector(v,"red");
}






