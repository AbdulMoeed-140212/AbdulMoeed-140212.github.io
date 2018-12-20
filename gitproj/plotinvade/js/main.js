var stats
//data Variables
var scene , camera, controls , box, plane , 
texturePlane   , boxList = [] , boxPoints =[] , boxWholeList = [];
//  number of boxes in a row // 
var gridBoxNumber = 15 ;
// direction of camera and Current player
var searchDir = 0	
// score keeping
var playerScore = [0 ,0 ]
// audio source
var sound
//Code
window.onload = function(){
	document.getElementById('mainpage').classList.remove("scale-out");
	M.toast({html:"Game Loading"})
	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );
	
	// then load texture 2
	texturePlane = new THREE.TextureLoader().load( 'images/img4.jpg', ()=>{
		// then start code;
		M.toast({html:"Game Loaded"})
		texturePlane.wrapS = THREE.RepeatWrapping;
		texturePlane.wrapT = THREE.RepeatWrapping;
		texturePlane.repeat.set( gridBoxNumber, gridBoxNumber );
		main();
		document.getElementById('gameover').style.display = "none";
		document.getElementById('startbtn').onclick = function(){
			document.getElementById('mainpage').classList.add("scale-out");
			document.onkeydown = checkKey;
		}
	} );


}
function gameOver(){
	document.getElementById('mainpage').classList.remove("scale-out");
	document.getElementById('gameover').style.display = "block";
	document.getElementById('score').innerHTML = "Player 1 : "+playerScore[0]+ " | Player 2 : "+playerScore[1]
	document.getElementById("canvas").removeChild(document.getElementById("canvas").firstChild)
	if(playerScore[0] > playerScore[1])
		M.toast({html : "Player 1 Win!!!!!!"})
	else
		M.toast({html : "Player 2 Win!!!!!!"})
	document.getElementById('startbtn').innerText = "Restart Game"
	document.getElementById('startbtn').onclick = function(){
		location.reload();
	}
}
function main(){
	setTemplateGrid(gridBoxNumber,gridBoxNumber)
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xe0f2f1 );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	controls = new THREE.OrbitControls( camera );
	controls.enableKeys = false
	var geometry = new THREE.BoxBufferGeometry( gridBoxNumber * 2 , gridBoxNumber * 2 , 2 )
	var material = new THREE.MeshPhongMaterial( {color : 0x263238, wireframe : false , shininess : 0, map:texturePlane , bumpMap : texturePlane} );
	plane = new THREE.Mesh( geometry, material); 
	scene.add(plane)


	makeMesh()
	
	// var axesHelper = new THREE.AxesHelper( 5 );
	// scene.add( axesHelper );
	var light = new THREE.DirectionalLight( COLORS["yellow"] , 1, 100);
	light.position.set( 1, 1, 0 );
	scene.add( light );
	
	scene.add(new THREE.AmbientLight(0xdddddd));

	camera.position.z = 50
	camera.position.y = -25
	camera.lookAt(new THREE.Vector3(0,0,0))
	// audio Listener
	var listener = new THREE.AudioListener();
	camera.add( listener );


	// load a sound and set it as the Audio object's buffer
	sound = new THREE.Audio( listener );

	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'sounds/ambient.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.7 );
		sound.play();
	}
	,

	// onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
	);
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById("canvas").appendChild( renderer.domElement );
	animate()
}
function setTemplateGrid(x , y){
	for(i =0 ; i< x ; i++){
		boxPoints.push([])
		for(j =0 ; j < y; j++){
			boxPoints[i].push(0)
		}
	}
} 



// Keyboard Controls
function checkKey(e) {
    e = e || window.event;
    switch(searchDir){
    	case 1: // player 2
    		if (e.keyCode == '38') {
		        // up arrow
		        box.startMotion(DIRECTIONS["up"])
		    }
		    else if (e.keyCode == '40') {
		        // down arrow
		        box.startMotion(DIRECTIONS["down"])
		    }
		    else if (e.keyCode == '37') {
		       // left arrow
		       box.startMotion(DIRECTIONS["left"])
		    }
		    else if (e.keyCode == '39') {
		    	// right arrow
		    	box.startMotion(DIRECTIONS["right"])
		    }
		    else if (e.keyCode == '32') {
		    	// space bar
		    	
		    	if(box.moving == false)
		    		makeMesh()
		    	
		    }
    	break;
    	case 0: // player 1
	    	if (e.keyCode == '38') {
		        // up arrow
		        box.startMotion(DIRECTIONS["down"])
		    }
		    else if (e.keyCode == '40') {
		        // down arrow
		        box.startMotion(DIRECTIONS["up"])
		    }
		    else if (e.keyCode == '37') {
		       // left arrow
		       box.startMotion(DIRECTIONS["right"])
		    }
		    else if (e.keyCode == '39') {
		    	// right arrow
		    	box.startMotion(DIRECTIONS["left"])
		    }
		    else if (e.keyCode == '32') {
		    	// space bar
		    	
		    	if(box.moving == false)
		    		makeMesh()
		    	
		    }
    	break;
    }
    
}
// Set grid array values of filled cells
function markPoints(a, b , w , h){
	w  = Math.round(w/2)
	h  = Math.round(h/2)

	if(w %2 == 0)
		a +=0.5
	if(h %2 == 0)
		b +=0.5
	initx = Math.ceil(a - w/2 )
	finalx = Math.floor(a + w/2)
	inity =  Math.ceil(b - h/2)
	finaly = Math.floor(b + h/2)

	if(w %2 == 0)
		finalx -=1
	if(h %2 == 0)
		finaly -=1
	for(i = initx ; i <= finalx ; i++){
		for(j =inity ; j <= finaly ; j++){
			boxPoints[j][i] = 1
		}
	}
}
// get new Empty position
function updatePosition(width){
	
	if(searchDir == 1){ // for player 2
		for(i= 0 ;i < gridBoxNumber ; i++){
			var ax = []
			for(j= 0 ; j < gridBoxNumber ; j++){
				if(boxPoints[i][j] == 0){
					ax.push({i:i,j:j});
					if(ax.length == width){
						searchDir = 0
						return [ax[0]["i"] , ax[0]["j"]];
					}
				}else{
					ax = []
				}
			}
			if(ax.length >= width){
				console.log(ax.length)
				break;
			}
		}
		
	}else{ // for player 1
		for(i= gridBoxNumber-1 ;i >= 0 ; i--){
			var ax = []
			for(j= 0 ; j < gridBoxNumber ; j++){
				if(boxPoints[i][j] == 0){
					ax.push({i:i,j:j});
					if(ax.length == width){						
						searchDir = 1
						return [ax[0]["i"] , ax[0]["j"]];
					}
				}else{
					ax = []
				}
			}
			if(ax.length >= width){
				console.log(ax.length)
				break;
			}
		}
	}
	gameOver();
	return [-100,-100]
}
// add new cube on plane
function makeMesh(){
	if(box){
		updateCamera(); // change camera
		// if(!box.isMoved) // make atleast one move
		// 	return;
		a = (Math.round(box.Mesh.position.x) + gridBoxNumber-1)/2
		b = gridBoxNumber -1 - (Math.round(box.Mesh.position.y) + gridBoxNumber-1)/2
		box.changeColor("accent");
		let bbox = new THREE.Box3().setFromObject(box.Mesh);
		markPoints(a , b,bbox.max.x - bbox.min.x ,bbox.max.y - bbox.min.y)

		playerScore[searchDir] += Math.round(bbox.max.x - bbox.min.x) + Math.round(bbox.max.y - bbox.min.y) - Math.round(bbox.max.z - bbox.min.z)
		if(searchDir == 1){
			box.changeColor("play1")
			M.toast({html : ("Player 2 : " + playerScore[searchDir]) })
		}
		else{
			box.changeColor("play2")
			M.toast({html : ("Player 1 : " + playerScore[searchDir]) })
		}
		bbox.expandByScalar(-0.5)
		boxList.push(bbox);
		boxWholeList.push(box); // whole object	
	}
	let max = 5 // max length or width of boxes
	x = Math.floor( Math.random()*max +1)
	y = Math.floor( Math.random()*max +1)
	currentxy =  updatePosition(x);
	var cubeSize = 2
	boundingPLanes = new THREE.Box3().setFromObject(plane);
	var geometry = new THREE.BoxBufferGeometry( cubeSize * x, cubeSize , cubeSize * y);
	var material = new THREE.MeshPhongMaterial( {color: COLORS["l5"]  , shininess : 0 , specular : 0x000000	 , wireframe:false} );
	var boxtemp = new THREE.Mesh( geometry, material ); 
	boxtemp.castShadow = true;
	boxtemp.position.z = (boundingPLanes.max.z +(cubeSize *y)/2)
	boxtemp.position.x = (boundingPLanes.min.x + (cubeSize*x)/ 2) + (cubeSize * currentxy[1])
	boxtemp.position.y = (boundingPLanes.max.y +(cubeSize)/2) - cubeSize - (cubeSize * currentxy[0])
	boundingPLanes.max.add(new THREE.Vector3(1 , 1, 100))
	boundingPLanes.min.add(new THREE.Vector3(-1 , -1, -100))
	//var geometry = new THREE.BoxBufferGeometry( 100, 100, 100 );
	var edges = new THREE.EdgesGeometry( geometry );
	var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
	boxtemp.add(line)

	box = new cube(boxtemp , boundingPLanes)


	scene.add(box.Mesh)
}
// game loop
function animate (){
	stats.begin();
	box.update();
	controls.update();
	renderer.render( scene, camera );
	stats.end();
	requestAnimationFrame( animate );	
}
// change camera position
function updateCamera(){
	if(camera.position.y < 0){
		camera.position.y = 25;
		camera.position.z = 50
		camera.position.x = 0
	}
	else{
		camera.position.y = -25;
		camera.position.z = 50
		camera.position.x = 0
	}
	camera.up = new THREE.Vector3(0,0,1);
	camera.lookAt(new THREE.Vector3(0,0,0))

}