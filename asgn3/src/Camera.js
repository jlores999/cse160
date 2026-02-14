class Camera{
	constructor(){
		//create attributes
		this.fov = 60
		this.eye = new Vector3([0, 0, 3]);
		this.at = new Vector3([0, 0, -1]);
		this.up = new Vector3([0, 1, 0]);

		this.viewMat = new Matrix4();
		this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMat.elements);

		this.projMat=new Matrix4();
		this.projMat.setPerspective(this.fov, canvas.width/canvas.height, .1, 1000); //dont change this
		gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projMat.elements);
	}

	updateViewMatrix(){
		this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMat.elements);
	}
	moveForward(){
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);
		f.normalize();
		f.mul(.5); //can change
		this.eye.add(f);
		this.at.add(f);
		if(this.eye.elements[1] < 0){
		    this.eye.elements[1] = 0;
		}
		if (this.eye.elements[0] < -16){
		    this.eye.elements[0] = -16;
		}
		if (this.eye.elements[2] < -16){
		    this.eye.elements[2] = -16;
		}
		if (this.eye.elements[0] > 16){
		    this.eye.elements[0] = 16;
		}
		if (this.eye.elements[2] > 16){
		    this.eye.elements[2] = 16;  // Was 0, should be 16
		}
		//this.updateViewMatrix();
}
	moveBackward(){
		let b = new Vector3();
		b.set(this.eye);
		b.sub(this.at);
		b.normalize();
		b.mul(.5); //can change
		this.eye.add(b);
		this.at.add(b);
		if(this.eye.elements[1] < 0){
		    this.eye.elements[1] = 0;
		}
		if (this.eye.elements[0] < -16){
		    this.eye.elements[0] = -16;
		}
		if (this.eye.elements[2] < -16){
		    this.eye.elements[2] = -16;
		}
		if (this.eye.elements[0] > 16){
		    this.eye.elements[0] = 16;
		}
		if (this.eye.elements[2] > 16){
		    this.eye.elements[2] = 16;  // Was 0, should be 16
		}
		//this.updateViewMatrix();
	}
	moveLeft(){
		let l = new Vector3();
		l.set(this.at);
		l.sub(this.eye);
		let s = Vector3.cross(this.up, l);
		s.normalize();
		s.mul(.1);
		this.eye.add(s);
		this.at.add(s);
		if(this.eye.elements[1] < 0){
		    this.eye.elements[1] = 0;
		}
		if (this.eye.elements[0] < -16){
		    this.eye.elements[0] = -16;
		}
		if (this.eye.elements[2] < -16){
		    this.eye.elements[2] = -16;
		}
		if (this.eye.elements[0] > 16){
		    this.eye.elements[0] = 16;
		}
		if (this.eye.elements[2] > 16){
		    this.eye.elements[2] = 16;  // Was 0, should be 16
		}
		//this.updateViewMatrix();
	}
	moveRight(){
		let r = new Vector3();
		r.set(this.at);
		r.sub(this.eye);
		let s =  Vector3.cross(r, this.up);
		s.normalize();
		s.mul(.1);
		this.eye.add(s);
		this.at.add(s);
		if(this.eye.elements[1] < 0){
		    this.eye.elements[1] = 0;
		}
		if (this.eye.elements[0] < -16){
		    this.eye.elements[0] = -16;
		}
		if (this.eye.elements[2] < -16){
		    this.eye.elements[2] = -16;
		}
		if (this.eye.elements[0] > 16){
		    this.eye.elements[0] = 16;
		}
		if (this.eye.elements[2] > 16){
		    this.eye.elements[2] = 16;  // Was 0, should be 16
		}
	//	this.updateViewMatrix();
	}
	panLeft(){
		let l = new Vector3();
		l.set(this.at);
		l.sub(this.eye);
		let rotMat = new Matrix4();
		rotMat.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		let l_prime = rotMat.multiplyVector3(l);
		this.at.set(this.eye);
		this.at.add(l_prime);
		//this.updateViewMatrix();
	}
	panRight(){
		let r = new Vector3();
		r.set(this.at);
		r.sub(this.eye);
		let rotMat = new Matrix4();
	    rotMat.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);		
	    let r_prime = rotMat.multiplyVector3(r);
	   	this.at.set(this.eye);
		this.at.add(r_prime);
	//	this.updateViewMatrix();
	}
	panWithAngle(angleY, angleX) {
	    // Horizontal rotation (left/right) - around Y axis
	    let forward = new Vector3();
	    forward.set(this.at);
	    forward.sub(this.eye);
	    
	    let rotMatY = new Matrix4();
	    rotMatY.setRotate(angleY, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
	    let forward_prime = rotMatY.multiplyVector3(forward);
	    
	    // Vertical rotation (up/down) - around right vector
	    let right = Vector3.cross(forward_prime, this.up);
	    right.normalize();
	    
	    let rotMatX = new Matrix4();
	    rotMatX.setRotate(angleX, right.elements[0], right.elements[1], right.elements[2]);
	    forward_prime = rotMatX.multiplyVector3(forward_prime);
	    
	    this.at.set(this.eye);
	    this.at.add(forward_prime);
	}
	/*deleteBlock(){
		let ray = new Vector3();
		ray.set(this.at);
		ray.sub(this.eye);
		ray.normalize();
		let maxDis = 10;
		let stepSize = 0.1;
		let steps = maxDis / stepSize;
		//let currentPos = self.eye;

		for (let i = 0; i < steps; i++){
		    let currentPos = new Vector3();
		    currentPos.set(this.eye);
		    
		    let offset = new Vector3();
		    offset.set(ray);
		    offset.mul(i * stepSize);
		    
		    currentPos.add(offset);
		    //console.log(currentPos.elements[0]);
			let x = Math.floor(currentPos.elements[0] + 16);
			let z = Math.floor(currentPos.elements[2] + 16);
			console.log(x, " ", z);
			if (x < 0 || x > 31 || z < 0 || z > 31){
				continue;
			}
			if (g_map[x][z] >= 1){
				console.log("found block");
				g_map[x][z] -= 1; 
				break;
			}

		}*/
	//}
	deleteBlock(){
		let direction = new Vector3();
		direction.set(this.at);
		direction.sub(this.eye);
		direction.normalize();
		let cameraPos = new Vector3();
		cameraPos.set(this.eye);
		cameraPos.add(direction);
		let x = Math.floor(cameraPos.elements[0] + 16);
		let z = Math.floor(cameraPos.elements[2] + 16);
		console.log(x, " ", z);
		if (x < 0 || x > 31 || z < 0 || z > 31){
			return;
		}
		if (g_map[x][z] >= 1){
			console.log("found block");
			g_map[x][z] -= 1; 
			return;
		}
		//if (g_map[x][z] >= 1){
		//	g_map[x][z] += g_map[x][z];
		//	return;
		//}

	}

	placeBlock(){
		let direction = new Vector3();
		direction.set(this.at);
		direction.sub(this.eye);
		direction.normalize();
		let cameraPos = new Vector3();
		cameraPos.set(this.eye);
		cameraPos.add(direction);
		let x = Math.floor(cameraPos.elements[0] + 16);
		let z = Math.floor(cameraPos.elements[2] + 16);
		console.log(x, " ", z);
		if (x < 0 || x > 31 || z < 0 || z > 31){
			return;
		}
		if (g_map[x][z] >= 0){
			console.log("block place");
			g_map[x][z] += 1; 
			let newHeight = g_map[x][z];
		
			// Set texture for the new layer
		if (newHeight == 1) t_map1[x][z] = tex_num;
		else if (newHeight == 2) t_map2[x][z] = tex_num;
		else if (newHeight == 3) t_map3[x][z] = tex_num;
		else if (newHeight == 4) t_map4[x][z] = tex_num;
				//t_map[x][z] = tex_num;
			return;
		}
	}
}