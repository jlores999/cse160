// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main(){
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0; //name of texture object
  void main(){
    gl_FragColor = u_FragColor;
    gl_FragColor = vec4(v_UV, 1.0,1.0);
    gl_FragColor = texture2D(u_Sampler0, v_UV);
  }`


 let body, neck, head, leg1, l_leg1, hoove1, cone_hat, leg2, l_leg2, hoove2;
 let leg3, l_leg3, hoove3, leg4, l_leg4, hoove4, tail, mane, f_mane;
 let l_ear, fl_ear, r_ear, fr_ear, l_eye, r_eye, l_pupil, r_pupil;
 let mouth, bottom_mouth, tongue, nose;

 let canvas;
 let gl;
 let a_Position;
 let u_FragColor;
 let u_Size;



let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;

 let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
 let g_selectedSize = 5.0;
 let g_selectedSeg = 10;
 let g_startTime = 0;
 let g_globalAngleY = 0;
 let g_globalAngleX = 0;
 let isDragging = false;
 let lastMouseX = 0;
 let lastMouseY = 0;

 let g_leg1Slide = 0;
 let g_l_leg1Slide = 0;
 let g_walkAnim = false;
 let g_shiftClickAnim = false;
 let g_shiftClickStartTime = 0;
 let g_shiftClickDuration = 2000;  // 2 seconds in milliseconds

 let g_leg2Slide = 0;
 let g_leg3Slide = 0;
 let g_leg4Slide = 0;

 let g_l_leg2Slide = 0;
 let g_l_leg3Slide = 0;
 let g_l_leg4Slide = 0;

 let g_mouthSlide = -50;


 //function setUpWebGL(){
    // Retrieve <canvas> element
  //canvas = document.getElementById('webgl');

 function setupWebGL(){
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl){
    console.log("Failed to get the rendering context for WebGl")
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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0){
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  /*
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size){
    console.log('Failed to get the storage location of u_Size');
  }
  */


  // Get the storage location of u_FragColor
  
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix){
    console.log("Failed to get storage location of u_ViewMatrix");
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix){
    console.log("failed to get location of u_ProjectionMatrix");
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

 }


function addActionsForHtmlUI(){
  document.getElementById("On").onclick = function() {g_walkAnim = true;};
  document.getElementById("Off").onclick = function() {g_walkAnim = false};
}

function main() {
  setupWebGL();
  connectVariablesToGSL();
  addActionsForHtmlUI();
  addMouseControl();
  initTextures();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Set projection matrix once
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  // Set view matrix once
  var viewMat = new Matrix4();
  viewMat.setLookAt(0, 0, 3, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  //renderScene();
  requestAnimationFrame(tick);
}

var frameCount = 0;
var fpsStartTime = performance.now();

var lastFrameTime = 0;
function tick(){
  var currentTime = performance.now();
  if (currentTime - lastFrameTime < 25) {
    requestAnimationFrame(tick);
    return;
  }
  lastFrameTime = currentTime;
  
  g_seconds = (performance.now() - g_startTime) / 1000.0;
  updateAnimationAngles();
  renderScene();
  
  frameCount++;
  if (currentTime - fpsStartTime >= 1000) {
    var fpsElement = document.getElementById("fps");
    if (fpsElement) {
      fpsElement.innerHTML = "FPS: " + frameCount;
    } else {
      console.log("FPS element not found!");
    }
    frameCount = 0;
    fpsStartTime = currentTime;
  }
  
  requestAnimationFrame(tick);
}

var g_shapesList = [];

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
      
      g_globalAngleX += deltaY * 0.5;
      g_globalAngleY += deltaX * 0.5;
      
      lastMouseX = ev.clientX;
      lastMouseY = ev.clientY;
      
      renderScene();  // Add this line to re-render when dragging
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

function initTextures() {
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(image); };
  // Tell the browser to load an image
  image.src = 'sky.jpg';
  //add more texture loading
  return true;
}

function sendImageToTEXTURE0(image) { //just replicate this function for more textures switch cases work too
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
//  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished load texture');
}

function updateAnimationAngles() {

    if (g_shiftClickAnim) {
        let elapsed = performance.now() - g_shiftClickStartTime;
        if (elapsed > g_shiftClickDuration) {
            g_shiftClickAnim = false;
            g_mouthSlide = -50;  // reset
        } else {
            // Oscillate mouth between -100 and -50
            g_mouthSlide = -75 + 25 * Math.sin((elapsed / g_shiftClickDuration) * Math.PI * 4);
        }
    }
  if (!g_walkAnim) return;

  let speed = 2;      // swing speed
  let A = 20;         // upper leg amplitude
  let B = 5;         // lower leg amplitude
  let t = g_seconds * speed;

  g_leg1Slide = A * Math.sin(t);         // front left
  g_leg2Slide = A * Math.sin(t + Math.PI); // front right
  g_leg3Slide = A * Math.sin(t + Math.PI); // back left
  g_leg4Slide = A * Math.sin(t);         // back right

  if (g_shiftClickAnim){
    let t_shift = (performance.now() - g_startTime) / 1000;
  }
}

function renderScene(){
  var globalRotMat = new Matrix4();
  globalRotMat.setRotate(g_globalAngleY, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!body) body = new Cube();
  body.color = [0.49, 0.19, 0.0, 1.0];
  body.matrix.setIdentity();
  body.matrix.scale(1, .4, .4);
  body.matrix.translate(-.5, -.5, 0);
  body.render();

  if (!neck) neck = new Cube();
  neck.color = [0.49, 0.19, 0.0, 1.0];
  neck.matrix.setIdentity();
  neck.matrix.rotate(-45,0,0,1);
  neck.matrix.translate(0,0.15,.05);
  neck.matrix.scale(0.3,0.6,0.3);
  neck.render();

  if (!head) head = new Cube();
  head.color = [0.49, 0.19, 0.0, 1.0];
  head.matrix.setIdentity();
  head.matrix.translate(0.64, 0.18 ,0.05);
  head.matrix.rotate(40,0,0,1);
  head.matrix.scale(0.2,.3,.3);
  head.render();

  if (!leg1) leg1 = new Cube();
  leg1.color = [0.49, 0.19, 0.0, 1.0];
  leg1.matrix.setIdentity();
  leg1.matrix.rotate(g_leg1Slide,0,0,1);
  leg1.matrix.translate(.35,-.5,0);
  leg1.matrix.scale(0.15, .5, .15);
  leg1.render();

  if (!l_leg1) l_leg1 = new Cube();
  l_leg1.color = [0.49, 0.19, 0.0, 1.0];
  l_leg1.matrix = new Matrix4(leg1.matrix);
  l_leg1.matrix.scale(1/0.15, 1/0.5, 1/0.15);
  l_leg1.matrix.rotate(g_leg1Slide, 0,0,1);  
  l_leg1.matrix.translate(0.02, -0.15, 0.02);  
  l_leg1.matrix.scale(0.12, .2, .12);
  l_leg1.render();

  if (!hoove1) hoove1 = new Cube();
  hoove1.color = [.1, .1, .1, 1];
  hoove1.matrix = new Matrix4(l_leg1.matrix);
  hoove1.matrix.scale(1/0.12, 1/0.2, 1/0.12);  
  hoove1.matrix.translate(0.02, -0.08, 0);  
  hoove1.matrix.scale(.13, .08, .13);
  hoove1.render();

  if (!cone_hat) cone_hat = new Cone();
  cone_hat.color = [0.3,0.3,1, 1];
  cone_hat.matrix.setIdentity();
  cone_hat.matrix.translate(.6,0.6,.13)
  cone_hat.matrix.rotate(-30,0,0,1);
  cone_hat.matrix.scale(.13,.2,.13);
  cone_hat.render();

  if (!leg2) leg2 = new Cube();
  leg2.color = [0.49, 0.19, 0.0, 1.0];
  leg2.matrix.setIdentity();
  leg2.matrix.rotate(g_leg2Slide, 0, 0);
  leg2.matrix.translate(.35,-.5,.25);
  leg2.matrix.scale(0.15, .5, .15);
  leg2.render();

  if (!l_leg2) l_leg2 = new Cube();
  l_leg2.color = [0.49, 0.19, 0.0, 1.0];
  l_leg2.matrix = new Matrix4(leg2.matrix);
  l_leg2.matrix.scale(1/0.15, 1/0.5, 1/0.15);  
  l_leg2.matrix.rotate(g_leg2Slide, 0,0,1);  
  l_leg2.matrix.translate(.02,-.15,.02);
  l_leg2.matrix.scale(0.12, .2, .12);
  l_leg2.render();

  if (!hoove2) hoove2 = new Cube();
  hoove2.color = [.1, .1, .1, 1];
  hoove2.matrix = new Matrix4(l_leg2.matrix);
  hoove2.matrix.scale(1/0.12, 1/0.2, 1/0.12);  
  hoove2.matrix.translate(0.02, -0.08, 0);  
  hoove2.matrix.scale(.13, .08, .13);
  hoove2.render();

  if (!leg3) leg3 = new Cube();
  leg3.color = [0.49, 0.19, 0.0, 1.0];
  leg3.matrix.setIdentity();
  leg3.matrix.rotate(g_leg3Slide, 0, 0,1);
  leg3.matrix.translate(-.5,-.5,.25);
  leg3.matrix.scale(0.15, .5, .15);
  leg3.render();

  if (!l_leg3) l_leg3 = new Cube();
  l_leg3.color = [0.49, 0.19, 0.0, 1.0];
  l_leg3.matrix = new Matrix4(leg3.matrix);
  l_leg3.matrix.scale(1/0.15, 1/0.5, 1/0.15); 
  l_leg3.matrix.rotate(g_leg3Slide, 0,0);   
  l_leg3.matrix.translate(.02,-.15,.02);
  l_leg3.matrix.scale(0.12, .2, .12);
  l_leg3.render();

  if (!hoove3) hoove3 = new Cube();
  hoove3.color = [.1, .1, .1, 1];
  hoove3.matrix = new Matrix4(l_leg3.matrix);
  hoove3.matrix.scale(1/0.12, 1/0.2, 1/0.12);  
  hoove3.matrix.translate(0.02, -0.08, 0);  
  hoove3.matrix.scale(.13, .08, .13);
  hoove3.render();

  if (!leg4) leg4 = new Cube();
  leg4.color = [0.49, 0.19, 0.0, 1.0];
  leg4.matrix.setIdentity();
  leg4.matrix.rotate(g_leg4Slide, 0, 0,1);
  leg4.matrix.translate(-.5,-.5,.0);
  leg4.matrix.scale(0.15, .5, .15);
  leg4.render();

  if (!l_leg4) l_leg4 = new Cube();
  l_leg4.color = [0.49, 0.19, 0.0, 1.0];
  l_leg4.matrix = new Matrix4(leg4.matrix);
  l_leg4.matrix.scale(1/0.15, 1/0.5, 1/0.15);  
  l_leg4.matrix.rotate(g_leg4Slide, 0,0,1);  
  l_leg4.matrix.translate(.02,-.15,.02);
  l_leg4.matrix.scale(0.12, .2, .12);
  l_leg4.render();

  if (!hoove4) hoove4 = new Cube();
  hoove4.color = [.1, .1, .1, 1];
  hoove4.matrix = new Matrix4(l_leg4.matrix);
  hoove4.matrix.scale(1/0.12, 1/0.2, 1/0.12);  
  hoove4.matrix.translate(0.02, -0.08, 0);  
  hoove4.matrix.scale(.13, .08, .13);
  hoove4.render();

  if (!tail) tail = new Cube();
  tail.color = [0.2,0.2,0.2,1];
  tail.matrix.setIdentity();
  tail.matrix.translate(-.2,-.45,0);
  tail.matrix.rotate(-20,0,0,1);
  tail.matrix.translate(-.5,0,0.15);
  tail.matrix.scale(.1,.5,.1);
  tail.render();

  if (!mane) mane = new Cube();
  mane.color = [0.2,0.2,0.2,1];
  mane.matrix.setIdentity();
  mane.matrix.translate(.2,.3,0.15);
  mane.matrix.rotate(-47,0,0,1);
  mane.matrix.scale(0.1, .5, .1); 
  mane.render();

  if (!f_mane) f_mane = new Cube();
  f_mane.color = [0.2,0.2,0.2,1];
  f_mane.matrix.setIdentity();
  f_mane.matrix.translate(.65,.42,.12);
  f_mane.matrix.rotate(35,0,0,1);
  f_mane.matrix.scale(.1, .2, .15);
  f_mane.render();

  if (!l_ear) l_ear = new Cube();
  l_ear.color = [0.49, 0.19, 0.0, 1.0];
  l_ear.matrix.setIdentity();
  l_ear.matrix.translate(0.60,.53,0.07);
  l_ear.matrix.rotate(-52,0,0,1);
  l_ear.matrix.scale(.05,.1,.05);
  l_ear.render();

  if (!fl_ear) fl_ear = new Cube();
  fl_ear.color = [0.29, 0.09, 0.0, 1.0];
  fl_ear.matrix.setIdentity();
  fl_ear.matrix.translate(0.64,.50,0.08);
  fl_ear.matrix.rotate(-52,0,0,1);
  fl_ear.matrix.scale(.03,.07,.03);
  fl_ear.render();

  if (!r_ear) r_ear = new Cube();
  r_ear.color = [0.49, 0.19, 0.0, 1.0];
  r_ear.matrix.setIdentity();
  r_ear.matrix.translate(0.60,.53,0.27);
  r_ear.matrix.rotate(-52,0,0,1);
  r_ear.matrix.scale(.05,.1,.05);
  r_ear.render();

  if (!fr_ear) fr_ear = new Cube();
  fr_ear.color = [0.29, 0.09, 0.0, 1.0];
  fr_ear.matrix.setIdentity();
  fr_ear.matrix.translate(0.64,.50,0.28);
  fr_ear.matrix.rotate(-52,0,0,1);
  fr_ear.matrix.scale(.03,.07,.03);
  fr_ear.render();

  if (!l_eye) l_eye = new Cube();
  l_eye.color = [1,1,1,1];
  l_eye.matrix.setIdentity();
  l_eye.matrix.translate(0.65,.34,0.03);
  l_eye.matrix.rotate(42,0,0,1);
  l_eye.matrix.scale(.07,.07,.02);
  l_eye.render();

  if (!r_eye) r_eye = new Cube();
  r_eye.color = [1,1,1,1];
  r_eye.matrix.setIdentity();
  r_eye.matrix.translate(0.65,.34,0.30);
  r_eye.matrix.rotate(42,0,0,1);
  r_eye.matrix.scale(.07,.07,.07);
  r_eye.render();

  if (!l_pupil) l_pupil = new Cube();
  l_pupil.color = [0.07,0.07,0.07,1.0];
  l_pupil.matrix.setIdentity();
  l_pupil.matrix.translate(0.65,.34,0.01);
  l_pupil.matrix.rotate(42,0,0,1);
  l_pupil.matrix.scale(.05,.05,.02);
  l_pupil.render();

  if (!r_pupil) r_pupil = new Cube();
  r_pupil.color = [0.07,0.07,0.07,1.0];
  r_pupil.matrix.setIdentity();
  r_pupil.matrix.translate(0.65,.34,0.37);
  r_pupil.matrix.rotate(42,0,0,1);
  r_pupil.matrix.scale(.05,.05,.02);
  r_pupil.render();

  if (!mouth) mouth = new Cube();
  mouth.color = [.49, .19, .0, 1];
  mouth.matrix.setIdentity();
  mouth.matrix.translate(.77, 0.10,0.06);
  mouth.matrix.rotate(40,0,0,1);
  mouth.matrix.scale(.15,.15,.28);
  mouth.render();

  if (!bottom_mouth) bottom_mouth = new Cube();
  bottom_mouth.color = [.49, .19, .0, 1];
  bottom_mouth.matrix.setIdentity();
  bottom_mouth.matrix.translate(0.6,0.18,0.13);
  bottom_mouth.matrix.rotate(g_mouthSlide,0,0,1);
  bottom_mouth.matrix.scale(.2,.05,.15);
  bottom_mouth.render();

  if (!tongue) tongue = new Cube();
  tongue.color = [.9,.6,.6,1];
  tongue.matrix = new Matrix4(bottom_mouth.matrix);
  tongue.matrix.scale(1/.2, 1/.05, 1/.15);
  tongue.matrix.translate(0.0,.05,0.0);
  tongue.matrix.scale(.2,.02,.15);
  tongue.render();

  if (!nose) nose = new Cube();
  nose.color = [.29,0.05,0,1];
  nose.matrix.setIdentity();
  nose.matrix.translate(.83,0.02,0.1);
  nose.matrix.rotate(40,0,0,1);
  nose.matrix.scale(.15,.1,.2);
  nose.render();
}
