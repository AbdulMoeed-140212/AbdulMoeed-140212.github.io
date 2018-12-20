var scene, camera , controls , renderer, mousePos, raycaster ,earth , helper ,spotLight;
var modes = {"normal":0 , "explore":1 , "radar" : 2 , "play": 3}
var selectedMode  = modes["normal"];
var mode = 0; 
var longitudeLabel = document.getElementById("long");
var latitudeLabel = document.getElementById("lat");
var altitudeLabel = document.getElementById("alt");
var altMaxLabel = document.getElementById("alt-max");
var altMinLabel = document.getElementById("alt-min");
var altAvgLabel = document.getElementById("alt-avg");

var altitudeData
var texture2 = new THREE.TextureLoader().load( 'images/alt2k.jpg', function(){
	altitudeData = getImageData(texture2.image)
} );



var stopAngle = 0
var dir = 1
var animeData = [];
var rotationFlags = {"start" : 0 ,"running":1 , "end" : 3 , "stop" : 4 , "laod":5}
var currentFlag = rotationFlags["stop"]
var waiting = 0;
var stopPoint =new  THREE.Vector3(0,0,0)

init();
animate();	

function animate() {

	if(currentFlag == rotationFlags["load"] && animeData.length > 0){
		currentFlag = rotationFlags["stop"]
		animationStartSteup();
		console.log("data Loaded" , animeData)
	}

	if(selectedMode == modes["play"]){
		switch(currentFlag){
			case rotationFlags["start"]:
				console.log("start")
				if(animeData.length <=0){
					currentFlag  = rotationFlags["stop"]
					document.getElementById('play-mode').innerHTML = ""
					playBtn.click();
					break;
				}
				var dataPoint = animeData[animeData.length-1].point
				var point = new THREE.Vector3(dataPoint.x, dataPoint.y , dataPoint.z)
				stopAngle = point.angleTo(camera.position)
				point.multiplyScalar(1.05)
				helper.position.copy( point );
				point.multiplyScalar(1.1)
				spotLight.angle = 0.36
				spotLight.position.copy(point)
				var dataPlayMode = animeData.pop()
				console.log(  dataPlayMode.des);
				document.getElementById('play-mode').innerHTML = divSetupPlayModeInfo(dataPlayMode);
				currentFlag = rotationFlags["running"]
				break;
			case rotationFlags["running"]:
				var cV2 = new THREE.Vector2(camera.position.x , camera.position.z)
				var hV2 = new THREE.Vector2(helper.position.x , helper.position.z)
				var cV2Angle = cV2.angle()
				var hV2Angle = hV2.angle();
				var angleRunning = cV2Angle - hV2Angle
				if(angleRunning > 0.1 ){
					stopAngle -=0.0174533
					camera.position.applyAxisAngle(new THREE.Vector3(0,1,0) , 0.09)
					camera.lookAt(new THREE.Vector3(0,0,0))
				}
				else if(angleRunning < -0.1){
					stopAngle -=0.0174533
					camera.position.applyAxisAngle(new THREE.Vector3(0,1,0) , -1 * 0.0174533)
					camera.lookAt(new THREE.Vector3(0,0,0))
				}
				else{
					stopAngle = 0
					currentFlag = rotationFlags["end"]
					waiting = 2;
				}
				break;
			case rotationFlags["end"]:
				waiting -= 0.01
				if(waiting <= 0)
					currentFlag = rotationFlags["start"]
				break;
		}

		// if(stopAngle > 0.0174533){
		// 	stopAngle -=0.0174533
		// 	camera.position.applyAxisAngle(new THREE.Vector3(0,1,0) , dir * 0.0174533)
		// 	camera.lookAt(new THREE.Vector3(0,0,0))
		// }
		// else{
		// 	stopAngle = 0
		// }
	}

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}


function init(){
	mousePos = new THREE.Vector2();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	controls = new THREE.OrbitControls( camera );
	controls.rotateSpeed = 0.5;
	controls.zoomSpeed = 0.5;
	controls.minDistance = 2;
	controls.maxDistance = 3;
	controls.panSpeed = 0.5;
	controls.enableDamping = true;
	controls.dampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];
	controls.enabled = true
	raycaster = new THREE.Raycaster();

	var texture = new THREE.TextureLoader().load( 'images/map1k.jpg' );
	texture.miniFilter = THREE.LinearMipMapNearestFilter

	var texture2 = new THREE.TextureLoader().load( 'images/alt2k.jpg');
	texture2.miniFilter = THREE.LinearMipMapNearestFilter

	var geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0xffffff , map : texture , bumpMap:texture2, bumpScale:5, wireframe : false, dithering: true , } );
	earth = new THREE.Mesh( geometry, material );
	scene.add( earth );


	// mouse click helper
	var geometry = new THREE.SphereBufferGeometry( 0.01, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0x000000 } );
	helper = new THREE.Mesh( geometry, material ); 
	scene.add(helper)
	spotLight = new THREE.SpotLight( 0xeee8aa , 2 , 7, 0.1, 1,2);
	spotLight.castShadow = true;
	spotLight.target = earth
	scene.add( spotLight );

	
	camera.position.z = 5;
	camera.position.x = 5;

	
	scene.add(new THREE.AmbientLight(0xffffff));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	controls.update();
	window.addEventListener( 'mousemove', onMouseMove, false );
	window.addEventListener( 'click', onMouseClick, false );
	window.addEventListener( 'resize', onWindowResize, false );

}


function getGeoLocation(uv){
	x = uv.x
	y = uv.y

	long = (x/(1/360)) - 180
	lat = (y/(1/180)) - 90
	return [ lat ,long ]
}
function getAltitude(uv){
	x = Math.floor(2000*uv.x);
	y = Math.floor(1000*uv.y )
	y = 1000 - y
	var color = getPixel( altitudeData, x, y);
	var Maxalt = 8848.0392/255 * color.r;
	return Maxalt
}
function getMinMaxAvgAltitude(uv){
	var imgh = 1000
	var imgw = 2000
	var x = Math.floor(2000*uv.x);
	var y = Math.floor(1000*uv.y )
	y = 1000 - y
	var min = 100000000
	var max = 0
	var avg = 0
	xCoords = []
	yCoords = []
	var radius = 20
	for(i=-radius; i < radius ; i++){
		tempCoord = x +i;
		if(tempCoord < 0)
			tempCoord += 2000 
		else if(tempCoord >2000)
			tempCoord -= 2000
		xCoords.push(tempCoord)

		tempCoord = y +i;
		if(tempCoord < 0)
			tempCoord += 1000 
		else if(tempCoord >1000)
			tempCoord -= 1000
		yCoords.push(tempCoord)
	}
	for(let i = 0; i < xCoords.length ; i++){
		for(let j = 0 ; j < yCoords.length; j++){
			let tempVal = getPixel( altitudeData, xCoords[i], yCoords[j]).r
			if(tempVal > max)
				max = tempVal;
			if(tempVal < min)
				min = tempVal;
			avg += tempVal
		}
	}
	avg /= (xCoords.length *yCoords.length)

	min = 8848.0392/255 *min
	max = 8848.0392/255 * max
	avg = 8848.0392/255 * avg 
	return {"min" :min , "max": max , "avg":avg}
}
function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	
	mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;	
}
function onMouseClick(event){
	raycaster.setFromCamera( mousePos, camera );
	var intersects = raycaster.intersectObjects( [earth] );
	if(intersects[0]){
		
		let x = intersects[ 0 ].point
		if(selectedMode == modes["normal"]){
			x.multiplyScalar(1.05)
			helper.position.copy( x );
			x.multiplyScalar(1.1)
			spotLight.position.copy( x );
		}
		if(selectedMode == modes["make"]){
			x.multiplyScalar(1.05)
			helper.position.copy( x );
			x.multiplyScalar(1.1)
			spotLight.position.copy( x );
		}
		if (selectedMode == modes["play"]){
			// x.multiplyScalar(1.05)
			// helper.position.copy( x );
			// x.multiplyScalar(1.1)
			// spotLight.position.copy( x );
			// stopAngle = intersects[0].point.angleTo(camera.position)
			// if(mousePos.x < 0 )
			// 	dir = -1
			// 	//stopAngle = (2 * Math.PI) - stopAngle
			// else
			// 	dir = 1
			return
		}
		if(selectedMode == modes["explore"]){
			x.multiplyScalar(1.05)
			helper.position.copy( x );
			x.multiplyScalar(1.1)
			spotLight.position.copy( x );
			spotLight.angle = 1.0
			var expValues = getMinMaxAvgAltitude(intersects[0].uv);
			altMaxLabel.style.display = "block"
			altMinLabel.style.display = "block"
			altAvgLabel.style.display = "block"
			altMaxLabel.innerHTML = "Maximum Altitude : " + expValues["max"].toFixed(5)+" m"
			altMinLabel.innerHTML = "Minimum Altitude : " + expValues["min"].toFixed(5)+" m"
			altAvgLabel.innerHTML = "Average Altitude : " + expValues["avg"].toFixed(5)+" m"
		}else{
			altMaxLabel.style.display = "none"
			altMinLabel.style.display = "none"
			altAvgLabel.style.display = "none"
		}
		var geo = getGeoLocation(intersects[0].uv);
		// console.log(geo)
		longitudeLabel.innerHTML = "Longitude : " +geo[1].toFixed(5)
		latitudeLabel.innerHTML =  "Latitude : " + geo[0].toFixed(5)
		altitudeLabel.innerHTML = "Altitude : " + getAltitude(intersects[0].uv).toFixed(5)+" m"
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.update();
}

//==================================================================
// Extract Image Data
function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

function getPixel( imagedata, x, y ) {

    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}

// ==================================
// GUI Button clicks
exploreBtn = document.getElementById("expMode")
radarBtn = document.getElementById("radWatch")
playBtn = document.getElementById('playMode')
makeBtn = document.getElementById('makeSeq')
saveSeqBtn = document.getElementById('saveSeq')
addLocBtn = document.getElementById('addLoc')
exploreBtn.onclick = ()=>{
	//call reset function 
	controls.enabled = true
	if(selectedMode != modes["explore"]){
		radarBtn.className = 'btn-deactive'
		playBtn.className = 'btn-deactive'
		makeBtn.className = 'btn-deactive'
		exploreBtn.className = 'btn-active'
		selectedMode = modes["explore"]
	}else{
		exploreBtn.className = 'btn-deactive'
		selectedMode = modes["normal"]
	}
	
}


radarBtn.onclick = ()=>{
	//call reset function 
	controls.enabled = true
	if(selectedMode != modes["radar"]){
		exploreBtn.className = 'btn-deactive'
		playBtn.className = 'btn-deactive'
		radarBtn.className = 'btn-active'
		makeBtn.className = 'btn-deactive'
		selectedMode = modes["radar"]
	}else{
		radarBtn.className = 'btn-deactive'
		selectedMode = modes["normal"]
	}
	
}

makeBtn.onclick = ()=>{
	controls.enabled = true
	
	exploreBtn.className = 'btn-deactive'
	radarBtn.className = 'btn-deactive'
	playBtn.className = "btn-deactive"
	makeBtn.className = "btn-deactive"
	selectedMode = modes["normal"]

	window.open('make.html', '_blank');
}

playBtn.onclick = ()=>{
	if(selectedMode != modes["play"]){
		console.log("play")
		exploreBtn.className = 'btn-deactive'
		radarBtn.className = 'btn-deactive'
		playBtn.className = "btn-active"
		makeBtn.className = 'btn-deactive'
		selectedMode = modes["play"]
		// disable everything
		document.getElementById("play-mode").style.display = "block"
		controls.disabled = true
		exploreBtn.disabled = true
		radarBtn.disabled = true
		// playBtn.disabled = true
		makeBtn.disabled = true
		fileInput.click();


	}else{
		playBtn.className = 'btn-deactive'
		selectedMode = modes["normal"]
		controls.enabled = true
		controls.disabled = false
		exploreBtn.disabled = false
		radarBtn.disabled = false
		playBtn.disabled = false
		makeBtn.disabled = false
		document.getElementById("play-mode").style.display = "none"
	}
}
//================================================
//Code for animation after loading animation data
function animationStartSteup(){
	camera.position.z = 2;
	camera.position.x = 2;
	currentFlag = rotationFlags["start"];
}
function divSetupPlayModeInfo(data){
	var src
	if(data.image){
		src = data.image
	}
	else 
		src = "images/marker.png"
	return "<img width = 100 height = 100 alt ='No Image'src = "+src+"><h1>"+data.des+"</h1><table><tr><td>Longitude</td><td>"+data.long+"</td></tr><tr><td>Latitude</td><td>"+data.lat+"</td></tr></table>"
}
//================================================
// file opening test
var element = document.createElement('div');
element.innerHTML = '<input type="file">';
var fileInput = element.firstChild;

fileInput.addEventListener('change', function() {
    var file = fileInput.files[0];

    if (file.name.match(/\.(txt|json)$/)) {
        var reader = new FileReader();

        reader.onload = function() {
            animeData =  JSON.parse(reader.result)
            currentFlag = rotationFlags["load"]
            console.log("loading")
        };

        reader.readAsText(file);
        
    } else {
        alert("File not supported, .txt or .json files only");
    }
});
