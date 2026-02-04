var VSHADER_SOURCE = `
	precision mediump float;
	attribute vec4 a_Position;
	attribute vec2 a_UV;
	varying vec2 v_UV;
	uniform mat4 u_ModelMatrix;
	uniform mat4 u_GlobalRotationMatrix;
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ProjectionMatrix;
	void main(){
		gl_position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotationMatrix * u_ModelMatrix;
		//v_UV = a_UV;
	}` 

var FSHADER_SOURCE = `
	precision mediump float;
	varying vec2 v_UV;
	uniform vec4 u_FragColor;
	void main(){
		gl_FragColor = u_FragColor;
		//gl_FragColor = vec4(v_UV, 1.0,1.0);
	}`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotationMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size){
  	console.log('Failed to get the storage location of u_Size');
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
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log("Failed to get storage location of u_GlobalRotateMatrix");
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_GlobalRotateMatrix){
    console.log("Failed to get storage location of u_ViewMatrix");
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

 }

 function main(){
 	setupWebGL();
 	connectVariablesToGSL();
 }