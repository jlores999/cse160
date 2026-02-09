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

}