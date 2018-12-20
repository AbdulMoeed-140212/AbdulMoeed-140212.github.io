// Direction codes
var DIRECTIONS = {up : 1 , down: 2 , left :3 , right : 4}
// reverse Direction codes
var DIRECTIONSReverse = [2,1,4,3]
// color values Constants
const COLORS  = { black : 0x27363B , white : 0xffffff , blue : 0x0000ff , yellow: 0xFDCEAA , red :0xc62828 , green : 0x99B998,
				l5 : 0xe0f2f1 , l4 :0xb2dfdb, l3 : 0x80cbc4, l2: 0x4db6ac, l1 : 0x26a69a, play1 : 0xff9800 , play2 : 0x03a9f4,
				d1: 0x009688, d2: 0x00897b, d3 : 0x00796b, d4: 0x00695c , d5:0x04d40 , accent : 0x00bfa5}
// class for box 
cube = function(mesh , planeB){
	this.Mesh = mesh
	this.planeBounds = planeB
	this.cubeSize= 2
	this.center = this.Mesh.position.clone()
	this.up = this.Mesh.position.clone()
	this.down = this.Mesh.position.clone()
	this.left = this.Mesh.position.clone()
	this.right = this.Mesh.position.clone()
	this.moving = false
	this.direction = DIRECTIONS["up"] 
	this.remainingMotion = 0
	this.rotationSpeed = 1.5708 / 30
	this.isMoved = false;
	// set up refrence positions
	this.setRefernces = function(){ // set Refrences of new rotation points
		var halfCubeSize =  0.1
		var bbox = new THREE.Box3().setFromObject(this.Mesh);
		this.center = this.Mesh.position.clone()
		this.center.z =bbox.min.z
		this.up.copy(this.center)
		this.down.copy(this.center)
		this.left.copy(this.center)
		this.right.copy(this.center)

		this.up.y = bbox.max.y
		this.down.y = bbox.min.y
		this.left.x = bbox.min.x
		this.right.x = bbox.max.x
		
	}

	
	this.startMotion = function(dir){ // start rolling animation in given direction
		this.isMoved = true;
		if(this.moving == false){
			this.moving = true
			this.direction = dir
			this.remainingMotion = 1.5708; // 90 deg
			this.setRefernces();
		}
	}
	this.update = function(){ // update function called in animation function
		if(this.moving){
			this.remainingMotion -= this.rotationSpeed
			if(this.remainingMotion <= 0){
				this.reset();
				return
			}
			switch(this.direction){
				case DIRECTIONS['up']:
					this.rotateAroundWorldAxis(this.up,new THREE.Vector3( 1, 0, 0 ),-this.rotationSpeed)
					break
				case DIRECTIONS['down']:
					this.rotateAroundWorldAxis(this.down,new THREE.Vector3( 1, 0, 0 ),this.rotationSpeed)
					break
				case DIRECTIONS['left']:
					this.rotateAroundWorldAxis(this.left,new THREE.Vector3( 0, 1, 0 ),-this.rotationSpeed)
					break
				case DIRECTIONS['right']:
					this.rotateAroundWorldAxis(this.right,new THREE.Vector3( 0, 1, 0 ),this.rotationSpeed)
					break
			}
				
		}
	}
	this.reset = function(){ // reverse if out of bounds
		this.moving = false
		this.remainingMotion = 0
		var bbox = new THREE.Box3().setFromObject(this.Mesh);
		if(this.planeBounds.containsBox(bbox) && !this.inOtherBoxes(bbox)){
			this.changeColor("l3")	
		}
		else{
			this.changeColor("red")
			this.startMotion(DIRECTIONSReverse[this.direction-1]);
		}
	}

	this.inOtherBoxes = function (bbox){ // check if it is inside other boxes
		for(i=0 ; i < boxList.length ; i++){
			if(boxList[i].intersectsBox(bbox))
				return true;
		}
		return false;
	}
	this.rotateAroundWorldAxis = function( point, axis, angle ) {// rolling
		var q = new THREE.Quaternion();
        q.setFromAxisAngle( axis, angle );

        this.Mesh.applyQuaternion( q );

        this.Mesh.position.sub( point );
        this.Mesh.position.applyQuaternion( q );
        this.Mesh.position.add( point );

	}
	this.Reverse = function(dir){ // move in reverse direction
		let bbox
		switch(this.dir){
			case DIRECTIONSReverse[dir]:
				this.rotateAroundWorldAxis(this.up,new THREE.Vector3( 1, 0, 0 ),-1.5708)
				break
			case DIRECTIONSReverse[dir]:
				this.rotateAroundWorldAxis(this.down,new THREE.Vector3( 1, 0, 0 ),-1.5708)
				break
			case DIRECTIONSReverse[dir]:
				this.rotateAroundWorldAxis(this.left,new THREE.Vector3( 0, 1, 0 ),-1.5708)
				break
			case DIRECTIONSReverse[dir]:
				this.rotateAroundWorldAxis(this.right,new THREE.Vector3( 0, 1, 0 ),-1.5708)
				break
		}
	}
	this.changeColor = function(color){ // color setter
		this.Mesh.material.color = new THREE.Color( COLORS[color] );
	}
}




