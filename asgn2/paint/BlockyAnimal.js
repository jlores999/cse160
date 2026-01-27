// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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

 let g_globalAngle = 0;

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
  gl.enable(gl.DEPTH_TEST);
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

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log("Failed to get storage location of u_GlobalRotateMatrix");
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

 }


function addActionsForHtmlUI(){
  //Button events
  //document.getElementById("red").onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; updateColorSliders();};
  //document.getElementById("orange").onclick = function () { g_selectedColor = [1.0, 0.5, 0.0, 1.0]; updateColorSliders();};
  //document.getElementById("yellow").onclick = function () { g_selectedColor = [1.0, 1.0, 0.0, 1.0]; updateColorSliders();};
  //document.getElementById("green").onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; updateColorSliders(); };  
  //document.getElementById("blue").onclick = function () { g_selectedColor = [0.0, 0.0, 1.0, 1.0]; updateColorSliders();};
  //document.getElementById("purple").onclick = function () { g_selectedColor = [0.5, 0.0, 0.5, 1.0]; updateColorSliders();};

  //document.getElementById("clear").onclick = function() {g_shapesList=[]; renderAllShapes()}; //not an explicit action to clear the state, rather more of a state
  //document.getElementById("undo").onclick = function() {undo()};
  //document.getElementById("pointButton").onclick = function() {g_selectedType=POINT};
  //document.getElementById("triButton").onclick = function() {g_selectedType=TRIANGLE};
  //document.getElementById("cirButton").onclick = function() {g_selectedType=CIRCLE};
 // document.getElementById("eqTriButton").onclick = function() {g_selectedType=EQ_TRI};

  //document.getElementById("drawPic").onclick = function() {drawPicture()};
  //document.getElementById("changeCan").onclick = function() {changeCanvasColor()};


  //ColorSlider Events
  //document.getElementById("redSlide").addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;});
  //document.getElementById("greenSlide").addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;});
  //document.getElementById("blueSlide").addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;});
  //Size Slider Events
  document.getElementById("angleSlide").addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();});
  //Segment Slider Events
  //document.getElementById("segSlide").addEventListener('mouseup', function() { g_selectedSeg = parseInt(this.value, 10);});
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
  renderScene();
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

function renderScene(){
  //Keep all drawings in the same function for simplicity

  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

   // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
    //g_shapesList[i].render();
  //}

  //body of horse
  var body = new Cube();
  body.color = [0.59, 0.29, 0.0, 1.0];
  body.matrix.scale(1, .4, .4);
  body.matrix.translate(-.5, -.5, 0);
  body.render();
  //horse rear
// horse neck
  var neck = new Cube();
  neck.color = [0.59, 0.29, 0.0, 1.0];
  neck.matrix.rotate(-45,0,0);
  neck.matrix.translate(0,0.15,.05);
  neck.matrix.scale(0.3,0.6,0.3);
  neck.render();
//horse head
  var head = new Cube();
  head.color = [0.59, 0.29, 0.0, 1.0];
  head.matrix.translate(.7,-0.0,0.05);
  head.matrix.rotate(35,0,0);
  head.matrix.scale(0.25,.5,.3);
  head.render();

//horse leg 1
  var leg1 = new Cube();
  leg1.color = [0.59, 0.29, 0.0, 1.0];
  leg1.matrix.translate(.35,-.5,0);
  leg1.matrix.scale(0.15, .5, .15);
  leg1.render();
//horse lower leg 1 will be used for animations
  var l_leg1 = new Cube();
  l_leg1.color = [0.59, 0.29, 0.0, 1.0];
  l_leg1.matrix.translate(.35,-.7,0);
  l_leg1.matrix.scale(0.15, .2, .15);
  l_leg1.render();
//horse hoove 1
  var hoove1 = new Cube();
  hoove1.color = [.1,.1,.1,1];
  hoove1.matrix.translate(.4,-.7,-.02);
  hoove1.matrix.scale(.13,.1,.18);
  hoove1.render();
//horse leg 2
  var leg2 = new Cube();
  leg2.color = [0.59, 0.29, 0.0, 1.0];
  leg2.matrix.translate(.35,-.5,.25);
  leg2.matrix.scale(0.15, .5, .15);
  leg2.render();
//horse lower leg 2
  var l_leg2 = new Cube();
  l_leg2.color = [0.59, 0.29, 0.0, 1.0];
  l_leg2.matrix.translate(.35,-.7,.25);
  l_leg2.matrix.scale(0.15, .2, .15);
  l_leg2.render();
//horse hoove 2
  var hoove2 = new Cube();
  hoove2.color = [.1,.1,.1,1];
  hoove2.matrix.translate(.4,-.7, .23);
  hoove2.matrix.scale(.13,.1,.18);
  hoove2.render();
//horse leg 3
  var leg3 = new Cube();
  leg3.color = [0.59, 0.29, 0.0, 1.0];
  leg3.matrix.translate(-.5,-.5,.25);
  leg3.matrix.scale(0.15, .5, .15);
  leg3.render();
//horse lower leg 3
  var l_leg3 = new Cube();
  l_leg3.color = [0.59, 0.29, 0.0, 1.0];
  l_leg3.matrix.translate(-.5,-.7,.25);
  l_leg3.matrix.scale(0.15, .2, .15);
  l_leg3.render();
//horse hoove 3
  var hoove3 = new Cube();
  hoove3.color = [.1,.1,.1,1];
  hoove3.matrix.translate(-.45,-.7, .23);
  hoove3.matrix.scale(.13,.1,.18);
  hoove3.render();
//horse leg 4
  var leg4 = new Cube();
  leg4.color = [0.59, 0.29, 0.0, 1.0];
  leg4.matrix.translate(-.5,-.5,.0);
  leg4.matrix.scale(0.15, .5, .15);
  leg4.render();
//horse lower leg 4
  var l_leg3 = new Cube();
  l_leg3.color = [0.59, 0.29, 0.0, 1.0];
  l_leg3.matrix.translate(-.5,-.7, 0);
  l_leg3.matrix.scale(0.15, .2, .15);
  l_leg3.render();
//horse hoove 3
  var hoove4 = new Cube();
  hoove4.color = [.1,.1,.1,1];
  hoove4.matrix.translate(-.45,-.7, -0.01);
  hoove4.matrix.scale(.13,.1,.18);
  hoove4.render();
//horse tail
  var tail = new Cube();
  tail.color = [0.2,0.2,0.2,1];
  tail.matrix.translate(-.2,-.45,0);
  tail.matrix.rotate(-20,0,0);
  tail.matrix.translate(-.5,0,0.15);
  tail.matrix.scale(.1,.5,.1);
  tail.render();
//maybe make the back of the horse more curve by adding a rotated block.
//horse mane
  var mane = new Cube();
  mane.color = [0.2,0.2,0.2,1];
  mane.matrix.translate(.2,.3,0.15);
  mane.matrix.rotate(-47,0,0);
  mane.matrix.scale(0.1, .5, .1); 
  mane.render();


  /*
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  //remeber we write backwards, the scale is happening first the the translation
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5); 
  body.render();

  //draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 0.0, 1.0];
  leftArm.matrix.setTranslate(0, -.5, 0.0);
  leftArm.matrix.rotate(-5,1,0,0);
  leftArm.matrix.rotate(0,0,0,1);
  leftArm.matrix.scale(0.25,.7,.5);
  leftArm.matrix.translate(-.5,0,0);
  leftArm.render();
  //test box
  var box = new Cube();
  box.color = [1.0, 0, 1.0, 1.0];
  box.matrix.translate(-.1,.1,.0,0);
  box.matrix.rotate(-30,1,0,0);
  box.matrix.scale(.2,.4,.2);
  box.render();*/

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