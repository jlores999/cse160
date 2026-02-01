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

 let g_globalAngleY = 0;
 let g_globalAngleX = 0;
 let isDragging = false;
 let lastMouseX = 0;
 let lastMouseY = 0;

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
  document.getElementById("angleSlide").addEventListener('mousemove', function() { g_globalAngleY = this.value; renderScene();});
}

function main() {

  setUpWebGL();
  connectVariablesToGSL();
  //Set up actions for the HTML UI
  addActionsForHtmlUI();

  addMouseControl();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.5, 1.0, 1.0);

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

function addMouseControl(){
  canvas.onmousedown = function(ev){
    isDragging = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  };
  canvas.onmousemove = function(ev) {
  if (isDragging) {
    let deltaX = ev.clientX - lastMouseX;
    let deltaY = ev.clientY - lastMouseY;
      
    g_globalAngleX += deltaY * 0.5;  // Adjust sensitivity with the multiplier
    g_globalAngleY += deltaX * 0.5;
      
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
      
    renderScene();
    }
  };

  canvas.onmouseup = function(ev) {
    isDragging = false;
  };
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

  var globalRotMat=new Matrix4().rotate(g_globalAngleY,0,1,0).rotate(g_globalAngleX, 1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

   // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
    //g_shapesList[i].render();
  //}

//body of horse
  var body = new Cube();
  body.color = [0.49, 0.19, 0.0, 1.0];
  body.matrix.scale(1, .4, .4);
  body.matrix.translate(-.5, -.5, 0);
  body.render();
  //horse rear
// horse neck
  var neck = new Cube();
  neck.color = [0.49, 0.19, 0.0, 1.0];
  neck.matrix.rotate(-45,0,0);
  neck.matrix.translate(0,0.15,.05);
  neck.matrix.scale(0.3,0.6,0.3);
  neck.render();
//horse head
  var head = new Cube();
  head.color = [0.49, 0.19, 0.0, 1.0];
  head.matrix.translate(0.64, 0.18 ,0.05);
  head.matrix.rotate(40,0,0);
  head.matrix.scale(0.2,.3,.3);
  head.render();

//horse leg 1
  var leg1 = new Cube();
  leg1.color = [0.49, 0.19, 0.0, 1.0];
  leg1.matrix.translate(.35,-.45,0);
  leg1.matrix.scale(0.15, .5, .15);
  leg1.render();
//horse lower leg 1 will be used for animations
  var l_leg1 = new Cube();
  l_leg1.color = [0.49, 0.19, 0.0, 1.0];
  l_leg1.matrix.translate(.365,-.65,0.02);
  l_leg1.matrix.scale(0.12, .2, .12);
  l_leg1.render();
//horse hoove 1
  var hoove1 = new Cube();
  hoove1.color = [.1,.1,.1,1];
  hoove1.matrix.translate(.4,-.73,.02);
  hoove1.matrix.scale(.13,.08,.13);
  hoove1.render();
//cone hat
  var cone_hat = new Cone();
  cone_hat.color = [0.3,0.3,1, 1];
  cone_hat.matrix.translate(.6,0.6,.13)
  cone_hat.matrix.rotate(-30,0,0);
  cone_hat.matrix.scale(.13,.2,.13);
  cone_hat.render();


//horse leg 2
  var leg2 = new Cube();
  leg2.color = [0.49, 0.19, 0.0, 1.0];
  leg2.matrix.translate(.35,-.45,.25);
  leg2.matrix.scale(0.15, .5, .15);
  leg2.render();
//horse lower leg 2
  var l_leg2 = new Cube();
  l_leg2.color = [0.49, 0.19, 0.0, 1.0];
  l_leg2.matrix.translate(.365,-.65,.265);
  l_leg2.matrix.scale(0.12, .2, .12);
  l_leg2.render();
//horse hoove 2
  var hoove2 = new Cube();
  hoove2.color = [.1,.1,.1,1];
  hoove2.matrix.translate(.4,-.73, .26);
  hoove2.matrix.scale(.13,.08,.13);
  hoove2.render();

//horse leg 3
  var leg3 = new Cube();
  leg3.color = [0.49, 0.19, 0.0, 1.0];
  leg3.matrix.translate(-.5,-.45,.25);
  leg3.matrix.scale(0.15, .5, .15);
  leg3.render();
//horse lower leg 3
  var l_leg3 = new Cube();
  l_leg3.color = [0.49, 0.19, 0.0, 1.0];
  l_leg3.matrix.translate(-.485,-.65,.265);
  l_leg3.matrix.scale(0.12, .2, .12);
  l_leg3.render();
//horse hoove 3
  var hoove3 = new Cube();
  hoove3.color = [.1,.1,.1,1];
  hoove3.matrix.translate(-.45,-.73, .26);
  hoove3.matrix.scale(.13,.08,.13);
  hoove3.render();


//horse leg 4
  var leg4 = new Cube();
  leg4.color = [0.49, 0.19, 0.0, 1.0];
  leg4.matrix.translate(-.5,-.45,.0);
  leg4.matrix.scale(0.15, .5, .15);
  leg4.render();
//horse lower leg 4
  var l_leg3 = new Cube();
  l_leg3.color = [0.49, 0.19, 0.0, 1.0];
  l_leg3.matrix.translate(-.485,-.65, 0.015);
  l_leg3.matrix.scale(0.12, .2, .12);
  l_leg3.render();
//horse hoove 4
  var hoove4 = new Cube();
  hoove4.color = [.1,.1,.1,1];
  hoove4.matrix.translate(-.45,-.73, 0.01);
  hoove4.matrix.scale(.13,.08,.13);
  hoove4.render();

//horse tail
  var tail = new Cube();
  tail.color = [0.2,0.2,0.2,1];
  tail.matrix.translate(-.2,-.45,0);
  tail.matrix.rotate(-20,0,0);
  tail.matrix.translate(-.5,0,0.15);
  tail.matrix.scale(.1,.5,.1);
  tail.render();
//maybe make the back of the horse more curve by adding a rotated block.?
//perhaps make it so the lower legs are translated a little bit so that it can look a litle curved
//horse mane
  var mane = new Cube();
  mane.color = [0.2,0.2,0.2,1];
  mane.matrix.translate(.2,.3,0.15);
  mane.matrix.rotate(-47,0,0);
  mane.matrix.scale(0.1, .5, .1); 
  mane.render();
//front mane
  var f_mane = new Cube();
  f_mane.color = [0.2,0.2,0.2,1];
  f_mane.matrix.translate(.65,.42,.12);
  f_mane.matrix.rotate(35,0,0);
  f_mane.matrix.scale(.1, .2, .15);
  f_mane.render();
//left ear
  var l_ear = new Cube();
  l_ear.color = [0.49, 0.19, 0.0, 1.0];
  l_ear.matrix.translate(0.60,.53,0.07);
  l_ear.matrix.rotate(-52,0,0);
  l_ear.matrix.scale(.05,.1,.05);
  l_ear.render();
//front left ear
  var fl_ear = new Cube();
  fl_ear.color = [0.29, 0.09, 0.0, 1.0];
  fl_ear.matrix.translate(0.64,.50,0.08);
  fl_ear.matrix.rotate(-52,0,0);
  fl_ear.matrix.scale(.03,.07,.03);
  fl_ear.render();
//right_ear
  var r_ear = new Cube();
  r_ear.color = [0.49, 0.19, 0.0, 1.0];
  r_ear.matrix.translate(0.60,.53,0.27);
  r_ear.matrix.rotate(-52,0,0);
  r_ear.matrix.scale(.05,.1,.05);
  r_ear.render();
//front right ear
  var fr_ear = new Cube();
  fr_ear.color = [0.29, 0.09, 0.0, 1.0];
  fr_ear.matrix.translate(0.64,.50,0.28);
  fr_ear.matrix.rotate(-52,0,0);
  fr_ear.matrix.scale(.03,.07,.03);
  fr_ear.render();


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
//left eye
  var l_eye = new Cube();
  l_eye.color = [1,1,1,1];
  l_eye.matrix.translate(0.65,.34,0.03);
  l_eye.matrix.rotate(42,0,0);
  l_eye.matrix.scale(.07,.07,.02);
  l_eye.render();
// right eye
  var r_eye = new Cube();
  r_eye.color = [1,1,1,1];
  r_eye.matrix.translate(0.65,.34,0.30);
  r_eye.matrix.rotate(42,0,0);
  r_eye.matrix.scale(.07,.07,.07);
  r_eye.render();
//left pupil
  var l_pupil = new Cube();
  l_pupil.color = [0.07,0.07,0.07,1.0];
  l_pupil.matrix.translate(0.65,.34,0.01);
  l_pupil.matrix.rotate(42,0,0);
  l_pupil.matrix.scale(.05,.05,.02);
  l_pupil.render();
//left pupil
  var r_pupil = new Cube();
  r_pupil.color = [0.07,0.07,0.07,1.0];
  r_pupil.matrix.translate(0.65,.34,0.37);
  r_pupil.matrix.rotate(42,0,0);
  r_pupil.matrix.scale(.05,.05,.02);
  r_pupil.render();
//mouth
  var mouth = new Cube();
  mouth.color = [.49, .19, .0, 1];
  //mouth.color = [0,0,0,1];
  mouth.matrix.translate(.77, 0.10,0.06);
  mouth.matrix.rotate(40,0,0);
  mouth.matrix.scale(.15,.15,.28);
  mouth.render();
//bottom mouth
  var bottom_mouth  = new Cube();
  bottom_mouth.color = [.49, .19, .0, 1];
  bottom_mouth.matrix.translate(0.6,0.16,0.13);
  bottom_mouth.matrix.rotate(-50,0,0);
  bottom_mouth.matrix.scale(.2,.05,.15);
  bottom_mouth.render();
//tongue
  var tongue = new Cube();
  tongue.color = [.9,.6,.6,1];
  tongue.matrix.translate(.65,.18,0.12);
  tongue.matrix.rotate(-50,0,0);
  tongue.matrix.scale(.2,.02,.15);
  tongue.render()
//nose
  var nose = new Cube();
  nose.color = [.29,0.05,0,1];
  nose.matrix.translate(.83,0.02,0.1);
  nose.matrix.rotate(40,0,0);
  nose.matrix.scale(.15,.1,.2);
  nose.render();
}
