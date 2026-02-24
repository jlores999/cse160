// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main(){
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0; //name of texture object
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform sampler2D u_Sampler6;
  uniform sampler2D u_Sampler7;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  void main(){
    if (u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    }
    else if (u_whichTexture == -2){ //Use color
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1){ //Use debug UV
      gl_FragColor = vec4(v_UV, 1.0,1.0);
    }
    else if (u_whichTexture == 0){ //Use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else if (u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    }
    else if (u_whichTexture == 5){
      gl_FragColor = texture2D(u_Sampler5, v_UV);
    }
    else if (u_whichTexture == 6){
      gl_FragColor = texture2D(u_Sampler6, v_UV);
    }
    else if (u_whichTexture == 7){
      gl_FragColor = texture2D(u_Sampler7, v_UV);
    }
    else{ //error
      gl_FragColor = vec4(1,.2,.2,1);
    }
    vec3 lightVector = vec3(v_VertPos) - u_lightPos;
    float r = length(lightVector);
    if (r<1.0){
      gl_FragColor = vec4(1,0,0,1);
    }
    else if (r<2.0){
      gl_FragColor = vec4(0,1,0,1);
    }




  }`


 let body, neck, head, leg1, l_leg1, hoove1, cone_hat, leg2, l_leg2, hoove2;
 let leg3, l_leg3, hoove3, leg4, l_leg4, hoove4, tail, mane, f_mane;
 let l_ear, fl_ear, r_ear, fr_ear, l_eye, r_eye, l_pupil, r_pupil;
 let mouth, bottom_mouth, tongue, nose;
 let floor_plane, sky;
 let wall, sp, light;

 let canvas;
 let gl;
 let a_Position;
 let u_FragColor;
 let u_Size;



let a_UV;
let a_Normal;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_whichTexture;

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


 let xSlide = 0;
 let ySlide = 0;
 let zSlide = 0;
 let u_lightPos;
 let g_lightPos =[0,0,0];
 let g_normalOn = false;


 let g_mouthSlide = -50;
 let globalRotMat = new Matrix4();
 let projMat = new Matrix4();

 let tex_num = 0;
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
 
  // Get the storage location of u_FragColor
  
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log("Failed to get storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log("Failed to get storage location of u_GlobalRotateMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix){
    console.log("Failed to get storage location of u_ViewMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix){
    console.log("failed to get location of u_ProjectionMatrix");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }
  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return;
  }
  u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
  if (!u_Sampler6) {
    console.log('Failed to get the storage location of u_Sampler6');
    return;
  }
  u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
  if (!u_Sampler7) {
    console.log('Failed to get the storage location of u_Sampler7');
    return;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture){
    console.log('failed to get location of u_whichTexture');
    return;
  }
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (!a_Normal){
    console.log('failed to get uniform location of a_Normal');
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos){
      console.log('failed to get uniform location of u_lightPos');
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

 }


function addActionsForHtmlUI(){
  document.getElementById("On").onclick = function() {g_walkAnim = true;};
  document.getElementById("Off").onclick = function() {g_walkAnim = false;};
  document.getElementById("normalOn").onclick = function() {g_normalOn = true;};
  document.getElementById("normalOff").onclick = function() {g_normalOn = false;};  
  document.getElementById("xSlide").addEventListener('mousemove', function() { g_lightPos[0] = this.value/100; renderScene();});
  document.getElementById("ySlide").addEventListener('mousemove', function() { g_lightPos[1] = this.value/100; renderScene();});
  document.getElementById("zSlide").addEventListener('mousemove', function() { g_lightPos[2] = this.value/100; renderScene();});
 

}
let camera;
function main() {
  setupWebGL();
  connectVariablesToGSL();
  addActionsForHtmlUI();
  camera = new Camera();
  addMouseControl();
  document.onkeydown = keydown;
  initTextures();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
  requestAnimationFrame(tick);
}

var frameCount = 0;
var fpsStartTime = performance.now();

var lastFrameTime = 0;
function tick(){
  var currentTime = performance.now();
  if (currentTime - lastFrameTime < 16) {
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
  // Click to lock pointer
  canvas.onclick = function() {
    canvas.requestPointerLock();
  };
  
  // Mouse movement handler
  document.addEventListener('mousemove', function(ev) {
    if (document.pointerLockElement === canvas) {
      camera.panWithAngle(-ev.movementX * 0.2, -ev.movementY * 0.2);
      camera.updateViewMatrix();
    }

  });
  renderScene();
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
  var image0 = new Image();  // Create the image object
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();
  var image4 = new Image();
  var image6 = new Image();
  var image7 = new Image();

  if (!image0) {
    console.log('Failed to create the image object 0');
    return false;
  }
  if (!image1) {
    console.log('Failed to create the image object 1');
    return false;
  }
  if (!image2) {
    console.log('Failed to create the image object 2');
    return false;
  }

  image0.onload = function(){ sendImageToTEXTURE0(image0); };
  image0.src = 'bush.jpg';

  image1.onload = function(){ sendImageToTEXTURE1(image1);};
  image1.src = 'diamond.jpg';

  //add more texture loading
  image2.onload = function(){ sendImageToTEXTURE2(image2);};
  image2.src = 'StoneBrick.jpg';

  image3.onload = function(){ sendImageToTEXTURE3(image3);};
  image3.src = 'grass.jpg';

  image4.onload = function(){ sendImageToTEXTURE4(image4);};
  image4.src = 'broccoli.jpg';
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
function sendImageToTEXTURE1(image) { //just replicate this function for more textures switch cases work too
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  console.log('finished load texture');
}

function sendImageToTEXTURE2(image) { 
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE2);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);
  
  console.log('finished load texture');
}

function sendImageToTEXTURE3(image) { 
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE3);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler3, 3);
  
  console.log('finished load texture');
}


function sendImageToTEXTURE4(image) { 
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE4);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler4, 4);
  
  console.log('finished load texture');
}

function updateAnimationAngles() {

    if (g_shiftClickAnim) {
        let elapsed = performance.now() - g_shiftClickStartTime;
        if (elapsed > g_shiftClickDuration) {
            g_shiftClickAnim = false;
            g_mouthSlide = -50; 
        } else {
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

  g_lightPos[0]= Math.cos(g_seconds);
}

function keydown(ev){
  if (ev.keyCode == 87){ //w
    camera.moveForward()
  } else
  if (ev.keyCode == 65){ //a
    camera.moveLeft();
  } else
  if (ev.keyCode == 68){ // s
    camera.moveRight();
  } else
  if (ev.keyCode == 83){ //d
    camera.moveBackward();
  }else
  if (ev.keyCode == 81){ //q
    camera.panLeft();
  } else
  if (ev.keyCode == 69){ //e
    camera.panRight();
  }
  if (ev.keyCode == 16){ //left shift
    camera.deleteBlock();
  }
  if (ev.keyCode == 90){ //z
    camera.placeBlock();
  }
  if (ev.keyCode == 49){
    tex_num = 1
  }
  if (ev.keyCode == 50){
    tex_num = 2
  }
  if (ev.keyCode == 51){
    tex_num = 3
  }
  if (ev.keyCode == 52){
    tex_num = 4
  }     
  camera.updateViewMatrix();
  //console.log(ev.keyCode);

}

var g_map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //1
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //2
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //3
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //4
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //5
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //6
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //7
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //8
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //9
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //10
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //11
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //12
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //13
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //14
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //15
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //16
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //17
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //18
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //19
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //20
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //21
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //22
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //23
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //24
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //25
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //26
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //27
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //28
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //29
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //30
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //31
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //32
];

var t_map1 =[
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//1
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2],//2
  [2,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,2],//3
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//4
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//5
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//6
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//7
  [2,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,2],//8
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2],//9
  [2,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2],//10
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//11
  [2,0,0,0,0,0,0,0,0,3,0,1,1,1,1,0,0,1,1,1,1,0,3,0,0,0,0,0,0,0,0,2],//12
  [2,3,0,0,0,0,0,0,3,0,0,1,1,1,1,0,0,1,1,1,1,0,0,3,0,0,0,0,0,0,3,2],//13
  [2,0,3,0,0,0,0,3,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,3,0,0,0,0,3,0,2],//14
  [2,0,0,3,3,3,3,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,3,3,3,3,0,0,2],//15
  [2,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,2],//16
  [2,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,2],//17
  [2,0,0,3,3,3,3,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,3,3,3,3,0,0,2],//18
  [2,0,3,0,0,0,0,3,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,3,0,0,0,0,3,0,2],//19
  [2,3,0,0,0,0,0,0,3,0,0,1,1,1,1,1,1,1,1,1,1,0,0,3,0,0,0,0,0,0,3,2],//20
  [2,0,0,0,0,0,0,0,0,3,0,1,1,1,1,1,1,1,1,1,1,0,3,0,0,0,0,0,0,0,0,2],//21
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//22
  [2,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,2],//23
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2],//24
  [2,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,2],//25
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//26
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//27
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//28
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//29
  [2,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,2],//30
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2],//31
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//32
];

var t_map2 =[
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//1
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//2
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//3
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//4
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//5
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//6
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//7
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//8
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//9
  [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2],//10
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//11
  [2,0,0,0,0,0,0,0,0,1,0,1,1,1,1,0,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,2],//12
  [2,1,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,1,2],//13
  [2,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,1,0,0,0,0,1,0,2],//14
  [2,0,0,1,0,0,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,0,0,1,0,0,2],//15
  [2,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,2],//16
  [2,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,2],//17
  [2,0,0,1,0,0,1,0,0,0,0,1,1,1,1,4,4,1,1,1,1,0,0,0,0,1,0,0,1,0,0,2],//18
  [2,0,1,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,1,0,2],//19
  [2,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,2],//20
  [2,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,2],//21
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//22
  [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2],//23
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//24
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//25
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//26
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//27
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//28
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//29
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//30
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//31
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//32
];
var t_map3 =[
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//1
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//2
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//3
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//4
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//5
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//6
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//7
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//8
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//9
  [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2],//10
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//11
  [2,0,0,0,0,0,0,0,0,1,0,1,1,1,1,0,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,2],//12
  [2,1,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,1,2],//13
  [2,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,1,0,0,0,0,1,0,2],//14
  [2,0,0,1,0,0,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,0,0,1,0,0,2],//15
  [2,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,2],//16
  [2,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,2],//17
  [2,0,0,1,0,0,1,0,0,0,0,1,1,1,1,4,4,1,1,1,1,0,0,0,0,1,0,0,1,0,0,2],//18
  [2,0,1,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,1,0,2],//19
  [2,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,2],//20
  [2,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,2],//21
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//22
  [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2],//23
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//24
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//25
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//26
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//27
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//28
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//29
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//30
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//31
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//32
];

var t_map4 =[
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//1
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//2
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//3
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//4
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//5
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//6
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//7
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//8
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//9
  [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2],//10
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//11
  [2,0,0,0,0,0,0,0,0,1,0,1,1,1,1,0,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,2],//12
  [2,1,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,1,2],//13
  [2,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,1,0,0,0,0,1,0,2],//14
  [2,0,0,1,0,0,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,0,0,1,0,0,2],//15
  [2,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,2],//16
  [2,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,2],//17
  [2,0,0,1,0,0,1,0,0,0,0,1,1,1,1,4,4,1,1,1,1,0,0,0,0,1,0,0,1,0,0,2],//18
  [2,0,1,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,1,0,2],//19
  [2,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,2],//20
  [2,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,2],//21
  [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2],//22
  [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2],//23
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//24
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//25
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//26
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//27
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//28
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],//29
  [2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2],//30
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2],//31
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],//32
];

var saved_map = structuredClone(g_map);

var saved_t1 = structuredClone(t_map1);

var saved_t2 = structuredClone(t_map2);

var saved_t3 = structuredClone(t_map3);

var saved_t4 = structuredClone(t_map4);

function drawMap(){
  if(!wall) {
    wall = new Cube();
  }

  const eyeX = camera.eye.elements[0];
  const eyeZ = camera.eye.elements[2];
  const eyeY = camera.eye.elements[1];
  let tex_num;
  for (let x=0; x<32; x++){
    for(let z=0; z<32; z++){
      if(g_map[x][z] >= 1){
        let height = g_map[x][z];
        if (height >= 4) height = 4;
          for (let y=0; y<height;y++){
  if (y == 0) tex_num = t_map1[x][z];
  else if (y == 1) tex_num = t_map2[x][z];
  else if (y == 2) tex_num = t_map3[x][z];
  else if (y == 3) tex_num = t_map4[x][z];

  if (tex_num == 0) tex_num = 1;
          wall.color = [0,0,0,1];
          wall.matrix.setIdentity();
          wall.textureNum = tex_num;
          wall.matrix.translate(x-16, y-.75, z-16);        
          wall.matrix.scale(1,1,1);
          wall.render();
        }
      }
    }
  }
}


function renderScene(){

  projMat.setPerspective(50, canvas.width/canvas.height, 1, 100); 
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);

 globalRotMat.setRotate(g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3f(u_lightPos,g_lightPos[0], g_lightPos[1], g_lightPos[2]);
 //drawMap();
  if (!light) light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.setIdentity();
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(.2,.2,.2);
  //light.matrix.translate(-.5,-.5,-.5);
  light.render();


  if (!sp) sp = new Sphere();
  if(g_normalOn) sp.textureNum = -3;
  else sp.textureNum = -1;
  //sp.textureNum = -2;
  sp.matrix.setIdentity();
  sp.matrix.translate(0,-1,-3);
  sp.matrix.scale(1,1,1);
  sp.render();


  if (!floor_plane) floor_plane = new Cube();
  floor_plane.color = [.1,.7,.1,1];
  floor_plane.matrix.setIdentity();
  floor_plane.textureNum = 1;
  floor_plane.matrix.translate(0,1,-3);
  floor_plane.matrix.scale(32,0,32);
//  floor_plane.render();

  if (!sky) sky = new Cube();
  sky.color = [.3,0.3,.3,1];
  sky.matrix.setIdentity();
  if (g_normalOn) sky.textureNum = -3;
  else sky.textureNum = -2;
  sky.matrix.scale(-10, -10,-10);
  sky.matrix.translate(-.5,-.3,-.7);
  sky.render();
  /*
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
  */
}
