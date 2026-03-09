//Juan Lores
//Three.js
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const view1Elem = document.querySelector( '#view1' );
	//const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
  	const renderer = new THREE.WebGLRenderer({
    	antialias: true,
    	canvas,
    	alpha: true,
  	});

const fov = 75;
const near = 0.1;
const far = 100;
const aspect = 2; // default, gets updated in render loop
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.set( 0, 10, 20 );

	const cameraHelper = new THREE.CameraHelper( camera );

	class MinMaxGUIHelper {

		constructor( obj, minProp, maxProp, minDif ) {

			this.obj = obj;
			this.minProp = minProp;
			this.maxProp = maxProp;
			this.minDif = minDif;

		}
		get min() {

			return this.obj[ this.minProp ];

		}
		set min( v ) {

			this.obj[ this.minProp ] = v;
			this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );

		}
		get max() {

			return this.obj[ this.maxProp ];

		}
		set max( v ) {

			this.obj[ this.maxProp ] = v;
			this.min = this.min; // this will call the min setter

		}

	}
	class ColorGUIHelper {
      constructor(object, prop) {
        this.object = object;
        this.prop = prop;
      }
      get value() {
        return '#' + this.object[this.prop].getHexString();
      }
      set value(hexString) {
        this.object[this.prop].set(hexString);
      }
    }

	const gui = new GUI();
	//gui.add( camera, 'zoom', 0.01, 1, 0.01 ).listen();
	const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
	gui.add( minMaxGUIHelper, 'min', 0.1, 100, 0.1 ).name( 'near' );
	gui.add( minMaxGUIHelper, 'max', 0.1, 100, 0.1 ).name( 'far' );

	const controls = new OrbitControls( camera, view1Elem );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );
	scene.add( cameraHelper );

	{

		const planeSize = 50; //floor blane

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'resources/images/wall.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshStandardMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}
    {
      const loader = new THREE.CubeTextureLoader();
      const texture = loader.load([
        'resources/images/space0.jpg',
        'resources/images/space1.jpg',
        'resources/images/space2.jpg',
        'resources/images/space3.jpg',
        'resources/images/space4.jpg', //swap
        'resources/images/space5.jpg',
      ]);
      scene.background = texture;
    }
    let eyeball;
	{
	  const mtlLoader = new MTLLoader();
	  mtlLoader.load('resources/objects/Eyeball.mtl', (materials) => {
	    materials.preload();
	    
	    const objLoader = new OBJLoader();
	    objLoader.setMaterials(materials);
	    objLoader.load('resources/objects/Eyeball.obj', (root) => {
	      root.position.set(0, 4, 3.5);
	      root.scale.set(1, 1, 1);
	      eyeball = root;
	      scene.add(root);
	    });
	  });
	}

	const cubeSize = 2;
	const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
	const cubeMat = new THREE.MeshBasicMaterial({ color: '#8AC', opacity: 0.5, transparent: true, depthWrite: false });

	const cubes = [];

	for (let i = 0; i < 3; i++) {
		const cube = new THREE.Mesh(cubeGeo, cubeMat.clone());
		cube.position.set(0, 10, 0);
		scene.add(cube);
		cubes.push(cube);
	}


	/*{
 
		const sphereRadius = 2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshBasicMaterial( { color: '#FFFFFF', } );
		const sphere = new THREE.Mesh( sphereGeo, sphereMat );
		sphere.position.set(0, 4, 2.5 );
		scene.add( sphere );

	}*/

	{

		const white = 0xFFFFFF;
		const ambientLight = new THREE.AmbientLight( 0xFFD700, .75 );  // gold lighting
		const dirLight = new THREE.DirectionalLight( white, 3 ); 
		const spotLight = new THREE.SpotLight(white, 100);

		dirLight.position.set( 0, 5, 10 );
		dirLight.target.position.set(0, 3, -10 );
		scene.add( dirLight );
		scene.add( dirLight.target );

		ambientLight.position.set(0,0,0);
		scene.add( ambientLight );

		spotLight.position.set(0,9,0);
		spotLight.target.position.set(0,0,0);
		scene.add(spotLight);



		  // GUI for all three lights
		const ambientFolder = gui.addFolder('Ambient Light');
		ambientFolder.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('color');
		ambientFolder.add(ambientLight, 'intensity', 0, 5).name('intensity');

		const dirFolder = gui.addFolder('Directional Light');
		dirFolder.addColor(new ColorGUIHelper(dirLight, 'color'), 'value').name('color');
		dirFolder.add(dirLight, 'intensity', 0, 10).name('intensity');

		const spotFolder = gui.addFolder('Spot Light');
		spotFolder.addColor(new ColorGUIHelper(spotLight, 'color'), 'value').name('color');
		spotFolder.add(spotLight, 'intensity', 0, 200).name('intensity');
		spotFolder.add(spotLight, 'angle', 0, Math.PI / 2).name('angle');
		spotFolder.add(spotLight, 'penumbra', 0, 1).name('penumbra');

	}

	{
		const bottomRadius = 10;   // base size
  		const topRadius = 2;    // smaller top
  		const height = 8;
  		const radialSegments = 4; // 4 sides for pyramid shape

  		const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, radialSegments);
  		const material = new THREE.MeshPhongMaterial({ color: 0x000000, flatShading: true });
  		const pyramid = new THREE.Mesh(geometry, material);

  		const pillarBRad = 1; //bottom radius for pillars
  		const pillarTRad = 1;//top radius for pillars same size as bottom
  		const pHeight = 4;
  		const pilGeo = new THREE.CylinderGeometry(pillarTRad, pillarTRad, pHeight, radialSegments);
  		const pilMat = new THREE.MeshPhongMaterial({ color: 0x000000, flatShading: true });
  		const pillar1 = new THREE.Mesh(pilGeo, pilMat);

  		const pillar2 = new THREE.Mesh(pilGeo, pilMat);
  		const pillar3 = new THREE.Mesh(pilGeo, pilMat);
  		const pillar4 = new THREE.Mesh(pilGeo, pilMat);

  // Rotate so base is flat on ground
  		pyramid.rotation.y = Math.PI / 4; // align edges
  		pyramid.position.set(0,4,0);
  		scene.add(pyramid);

  		pillar1.rotation.y = Math.PI / 4; // align edges
  		pillar1.position.set(7,2,6.4);
  		scene.add(pillar1);

  		pillar2.rotation.y = Math.PI / 4; // align edges
  		pillar2.position.set(-7,2,-6.4);
  		scene.add(pillar2);

  		pillar3.rotation.y = Math.PI / 4; // align edges
  		pillar3.position.set(7,2,-6.4);
  		scene.add(pillar3);

  		pillar4.rotation.y = Math.PI / 4; // align edges
  		pillar4.position.set(-7,2,6.4);
  		scene.add(pillar4);



	}
	const mouse = new THREE.Vector2();

	window.addEventListener('mousemove', (e) => {
  	 mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
 	 mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;
	});

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function setScissorForElement( elem ) {

		const canvasRect = canvas.getBoundingClientRect();
		const elemRect = elem.getBoundingClientRect();

		// compute a canvas relative rectangle
		const right = Math.min( elemRect.right, canvasRect.right ) - canvasRect.left;
		const left = Math.max( 0, elemRect.left - canvasRect.left );
		const bottom = Math.min( elemRect.bottom, canvasRect.bottom ) - canvasRect.top;
		const top = Math.max( 0, elemRect.top - canvasRect.top );

		const width = Math.min( canvasRect.width, right - left );
		const height = Math.min( canvasRect.height, bottom - top );

		// setup the scissor to only render to that part of the canvas
		const positiveYUpBottom = canvasRect.height - bottom;
		renderer.setScissor( left, positiveYUpBottom, width, height );
		renderer.setViewport( left, positiveYUpBottom, width, height );

		// return the aspect
		return width / height;

	}

	function render(time) {

		resizeRendererToDisplaySize( renderer );

		// turn on the scissor
		renderer.setScissorTest( true );

		// render the original view
		{

			const aspect = setScissorForElement( view1Elem );

			// update the camera for this aspect
camera.aspect = aspect;
camera.updateProjectionMatrix();
			cameraHelper.update();

			// don't draw the camera helper in the original view
			cameraHelper.visible = false;

			renderer.render( scene, camera );

		}
		time *= 0.001;  // convert time to seconds
 
  		cubes[0].rotation.x = -time;
  		cubes[0].rotation.y = time;

  		cubes[1].rotation.y = -time;
  		cubes[1].rotation.z = time;

  		cubes[2].rotation.x = time;
  		cubes[2].rotation.z = -time;  
  		cubes[0].material.color.setHSL( 0.6, 1, Math.sin(time + 1) * 0.2 + 0.5 );
		cubes[1].material.color.setHSL( 0.6, 1, Math.sin(time + 1) * 0.2 + 0.5 );
		cubes[2].material.color.setHSL( 0.6, 1, Math.sin(time + 1) * 0.2 + 0.5 );

  		if (eyeball) {
  			const target = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 10);
  			eyeball.lookAt(target);
		}
 
  		//renderer.render(scene, camera);
 
  		requestAnimationFrame(render);
	}

	requestAnimationFrame( render );

}

main();
