// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

 const POINT = 0;
 const TRIANGLE = 1;
 const CIRCLE = 2;
 const EQ_TRI = 3;

 let canvas;
 let gl;
 let a_Position;
 let u_FragColor;
 let u_Size;
 let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
 let g_selectedSize = 5.0;
 let g_selectedType = POINT;
 let g_selectedSeg = 10;
 function setUpWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 }

 function connectVariablesToGSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log("Failed to get storage location of u_ModelMatrix");
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

 }


function addActionsForHtmlUI(){
  //Button events
  document.getElementById("red").onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; updateColorSliders();};
  document.getElementById("orange").onclick = function () { g_selectedColor = [1.0, 0.5, 0.0, 1.0]; updateColorSliders();};
  document.getElementById("yellow").onclick = function () { g_selectedColor = [1.0, 1.0, 0.0, 1.0]; updateColorSliders();};
  document.getElementById("green").onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; updateColorSliders(); };  
  document.getElementById("blue").onclick = function () { g_selectedColor = [0.0, 0.0, 1.0, 1.0]; updateColorSliders();};
  document.getElementById("purple").onclick = function () { g_selectedColor = [0.5, 0.0, 0.5, 1.0]; updateColorSliders();};

  document.getElementById("clear").onclick = function() {g_shapesList=[]; renderAllShapes()}; //not an explicit action to clear the state, rather more of a state
  document.getElementById("undo").onclick = function() {undo()};
  document.getElementById("pointButton").onclick = function() {g_selectedType=POINT};
  document.getElementById("triButton").onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById("cirButton").onclick = function() {g_selectedType=CIRCLE};
  document.getElementById("eqTriButton").onclick = function() {g_selectedType=EQ_TRI};

  document.getElementById("drawPic").onclick = function() {drawPicture()};
  document.getElementById("changeCan").onclick = function() {changeCanvasColor()};


  //ColorSlider Events
  document.getElementById("redSlide").addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;});
  document.getElementById("greenSlide").addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;});
  document.getElementById("blueSlide").addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;});
  //Size Slider Events
  document.getElementById("sizeSlide").addEventListener('mouseup', function() { g_selectedSize = this.value;});
  //Segment Slider Events
  document.getElementById("segSlide").addEventListener('mouseup', function() { g_selectedSeg = parseInt(this.value, 10);});
}

function main() {

  setUpWebGL();
  connectVariablesToGSL();
  //Set up actions for the HTML UI
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}}; //button is 1 when the mouse is held down

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
}

var g_shapesList = [];
function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  }
  else if (g_selectedType == CIRCLE){
    point = new Circle();
    point.segments = g_selectedSeg;
  }
  else if (g_selectedType = EQ_TRI){
    point = new Eq_Triangle();
  }
  point.position =[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);


  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x, y]);
}

function renderAllShapes(){

   // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
    //g_shapesList[i].render();
  //}
  drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);

  //draw a cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  //remeber we write backwards, the scale is happening first the the translation
  body.matrix.translate(-.25, -.5, 0.0);
  body.matrix.scale(0.5, 1, .5)
  body.render();

  //draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 0.0, 1.0];
  leftArm.matrix.translate(.7, 0.0, 0.0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, .7, .5);
  leftArm.render();

}
function drawPicture(){
  //background set up
  gl.clearColor(.53, .81, .92, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //triangle aura
  gl.uniform4f(u_FragColor, .8, 0.2, 1.0, 1.0);
  drawTriangle([-0.1, 0.5, 0.1, 0.5, 0.0, 0.7]);
  drawTriangle([-0.1, -0.25, 0.1, -0.25, -0.1, 0.5]);
  drawTriangle([0.1, -0.25, 0.1, 0.5, -0.1, 0.5]);
  drawTriangle([-.1, .1,   -.6, .25,  -.1, .25]);
  drawTriangle([.1, .1,   .6, .25,  .1, .25]);

  drawTriangle([-.25, .25,   -.7, .35,  -.25, .35]);
  drawTriangle([.25, .25,   .7, .35,  .25, .35]);
  //Blade
  //gl.uniform4f(u_FragColor, .5, .5, .5, 1.0);
  gl.uniform4f(u_FragColor, 0.0, 0.6, 0.9, 1.0);
  drawTriangle([-0.05, -0.2, 0.05, -0.2, -0.05, 0.5]);
  drawTriangle([0.05, -0.2, 0.05, 0.5, -0.05, 0.5]);
  drawTriangle([-0.05, 0.5, 0.05, 0.5, 0.0, 0.6]);
  //J hilt
//gl.uniform4f(u_FragColor, .65, 0.2, 0.2, 1.0);
  drawTriangle([0.0,-0.07,      -0.05, -0.25, -0.05, -0.07]);
  drawTriangle([0.0, -0.07,     0, -0.25,   -0.05, -0.25]);
  drawTriangle([-0.05, -0.25,     -0.2, -.25,  -.05, -.22]);
  drawTriangle([-0.2, -.25,   -.2, -.22,  -.05, -.22]);
  drawTriangle([-.2, -.22,  -.2, -.15,   -.15, -.22]);
  drawTriangle([ -0.15, -0.15,  -0.2, -0.15,  -0.15, -0.22 ]);
  //L Hilt
  drawTriangle([ 0.0, -0.07,   0.05, -0.25,   0.05, -0.07 ]);
  drawTriangle([ 0.0, -0.07,   0.0,  -0.25,   0.05, -0.25 ]);
  drawTriangle([ 0.05, -0.25,   0.2, -0.25,   0.05, -0.22 ]);
  drawTriangle([ 0.2,  -0.25,   0.2, -0.22,   0.05, -0.22 ]);
  //Broken piece of L hilt
  drawTriangle([0.15, -0.45, 0.3, -0.45, 0.15, -0.42]);
  drawTriangle([0.3, -0.45, 0.3, -0.42, 0.15, -0.42]);
  //line for initials
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([-0.005, -0.25, 0.005, -0.25, -0.005, 0.55]);
  drawTriangle([0.005, -0.25, 0.005, 0.55, -0.005, 0.55]);

  //sword grip
  gl.uniform4f(u_FragColor, .25, .25, .25, 1.0); 
  drawTriangle([-0.05, -0.25, -0.05, -0.45, 0.05, -0.25]);
  drawTriangle([0.05, -0.25, -0.05, -0.45, 0.05, -0.45]);
  //bottom
  gl.uniform4f(u_FragColor, .1, .1, .1, 1.0);
  drawTriangle([-0.4, -0.45, 0.4, -0.45, -0.4, -1.0]);
  drawTriangle([0.4, -0.45, 0.4, -1.0, -0.4, -1.0]);
  //hill
  gl.uniform4f(u_FragColor, .0, 1.0, .0, 1.0);
  drawTriangle([-2, -0.45, -0.05, -0.45, -2, -5]);
  drawTriangle([1, -0.45, 0.05, -0.45, 2, -5]);
  //left spikes
  gl.uniform4f(u_FragColor, .6, .4, .3, 1.0);  
  drawTriangle([-0.5, -0.25, -0.55, -0.45, -0.45, -0.25]);
  drawTriangle([-0.45, -0.25, -0.55, -0.45, -0.45, -0.45]);
  drawTriangle([-.5, -.25,   -.45, -.25,    -.45, 0.0]);

  drawTriangle([-0.7, -0.25, -0.75, -0.45, -0.65, -0.25]);
  drawTriangle([-0.65, -0.25, -0.75, -0.45, -0.65, -0.45]);
  drawTriangle([-.7, -.25,   -.65, -.25,    -.65, 0.2]);

  //right spikes
  drawTriangle([0.5, -0.25, 0.55, -0.45, 0.45, -0.25]);
  drawTriangle([0.45, -0.25, 0.55, -0.45, 0.45, -0.45]);
  drawTriangle([.5, -.25,   .45, -.25,    .45, 0.0]);

  drawTriangle([0.7, -0.25, 0.75, -0.45, 0.65, -0.25]);
  drawTriangle([0.65, -0.25, 0.75, -0.45, 0.65, -0.45]);
  drawTriangle([.7, -.25,   .65, -.25,    .65, 0.2]);
}
function changeCanvasColor(){
  gl.clearColor(g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
}
function updateColorSliders() {
  document.getElementById("redSlide").value   = g_selectedColor[0] * 100;
  document.getElementById("greenSlide").value = g_selectedColor[1] * 100;
  document.getElementById("blueSlide").value  = g_selectedColor[2] * 100;
}
function undo(){
  g_shapesList.pop();
  renderAllShapes();
}