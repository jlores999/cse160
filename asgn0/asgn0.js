// DrawTriangle.js (c) 2012 matsuda
let ctx;
let canvas;

function angleBetween(v1, v2){
  let d = Vector3.dot(v1, v2);2
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();
  let ang = Math.acos( d / (m1 * m2));
  let angleDeg = ang * (180 / Math.PI);
  return angleDeg;
}
function handleDrawOperationEvent() {
  ctx.save(); 
  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore(); 
  const x1 = document.getElementById("x1").value;
  const y1 = document.getElementById("y1").value;
  const x2 = document.getElementById("x2").value;
  const y2 = document.getElementById("y2").value;
  const s = Number(document.getElementById("scalar").value);
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
  var val = document.getElementById("op-select").value;
  if (val === "+"){
    drawVector(v1.add(v2), "green");
  } 
  else if (val === "-"){
    drawVector(v1.sub(v2), "green");
  }
  else if (val === "*"){
    drawVector(v1.mul(s), "green");
    drawVector(v2.mul(s), "green");
  }
  else if (val === "/"){
    drawVector(v1.div(s), "green");
    drawVector(v2.div(s), "green");
  }
  else if (val === "mag"){
    console.log(v1.magnitude());
    console.log(v2.magnitude());
  }
  else if (val === "norm"){
    drawVector(v1.normalize(), "green");
    drawVector(v2.normalize(), "green");
  }
  else if (val === "angle"){
    console.log(angleBetween(v1,v2));
  }
  else {
    alert("Enter a valid input");
    return;
  }
}
function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(v.elements[0]*20, v.elements[1]*20);
  ctx.strokeStyle = color;
  ctx.stroke();
}
function handleDraw() {
 
  ctx.save(); 
  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  ctx.restore(); 
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










