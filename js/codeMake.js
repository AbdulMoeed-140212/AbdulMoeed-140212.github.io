let addBtn = document.getElementById('addBtn');
let saveBtn = document.getElementById('saveBtn');

var data = []
var tempPoint;
addBtn.onclick = ()=>{
	let long  = document.getElementsByName("long")[0]
	let lat   = document.getElementsByName("lat")[0]
	let des   = document.getElementsByName("des")[0]
	var imgData = document.getElementById("tempImg")

	var list = document.getElementById('list');
	var entry = document.createElement('li');
	entry.innerHTML = "<ul><li>Longitude :"+long.value+"</li><li>Latitude : "+lat.value+"</li><li>Description : "+des.value+"</li><li><img with='50' height= '50' src = "+imgData.src+"></li><ul>"
	list.appendChild(entry);
	
	data.push({"long" : long.value , "lat" : lat.value , "des" : des.value , point : tempPoint , image : imgData.src })
	long.value  = ""
	lat.value = ""
	des.value = ""
	des.focus();

}

saveBtn.onclick =()=>{
	data = data.reverse()
	download(JSON.stringify(data), 'json.txt', 'text/plain');
}

// save as
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


// gui data gathering
var scene, camera , controls , renderer, mousePos, raycaster ,earth , helper, spotLight;

init();
animate();

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

function init(){
	var drawDiv = document.getElementById("draw")
	mousePos = new THREE.Vector2();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, 500 / 500, 1, 1000 );
	
	raycaster = new THREE.Raycaster();

	var texture = new THREE.TextureLoader().load( 'images/map1k.jpg' );
	texture.miniFilter = THREE.LinearMipMapNearestFilter

	var geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0xffffff , map : texture } );
	earth = new THREE.Mesh( geometry, material );
	scene.add( earth );

	// mouse click helper
	var geometry = new THREE.SphereBufferGeometry( 0.01, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0x000000 } );
	helper = new THREE.Mesh( geometry, material ); 
	scene.add(helper)
	spotLight = new THREE.SpotLight( 0xeee8aa , 2 , 100, 0.1, 1,2);
	spotLight.castShadow = true;
	spotLight.target = earth
	scene.add( spotLight );
	
	camera.position.z = 5;
	camera.position.x = 5;

	scene.add(new THREE.AmbientLight(0xffffff));

	var drawDiv = document.getElementById("draw")
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( 500, 500 );
	document.getElementById("draw").appendChild( renderer.domElement );
	
	window.addEventListener( 'mousemove', onMouseMove );
	window.addEventListener( 'click', onMouseClick );
	window.addEventListener( 'resize', onWindowResize, false );
	controls = new THREE.OrbitControls( camera , renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.zoomSpeed = 0.5;
	controls.minDistance = 2;
	controls.maxDistance = 3;
	controls.panSpeed = 0.5;
	controls.enableDamping = true;
	controls.dampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];
	controls.enabled = true
	controls.update();
}

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	
	rect = event.target.getBoundingClientRect()
	mousePos.x = (event.clientX - rect.left)/500 *2 -1;
	mousePos.y= 1- ((event.clientY - rect.top)/500 * 2 );  

}

function onMouseClick(event){
	raycaster.setFromCamera( mousePos, camera );
	var intersects = raycaster.intersectObjects( [earth] );
	if(intersects[0]){
		
		let x = intersects[ 0 ].point
		tempPoint = {"x" : x.x , "y":x.y, "z":x.z}
		x.multiplyScalar(1.05)
		helper.position.copy( x );
		x.multiplyScalar(1.1)
		spotLight.position.copy( x );
		var geo = getGeoLocation(intersects[0].uv);
		document.getElementsByName("long")[0].value = geo[1]
		document.getElementsByName("lat")[0].value = geo[0]
		
	}
}

function onWindowResize() {
	// camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// renderer.setSize( window.innerWidth, window.innerHeight );
	controls.update();
}

function getGeoLocation(uv){
	x = uv.x
	y = uv.y

	long = (x/(1/360)) - 180
	lat = (y/(1/180)) - 90
	return [ lat ,long ]
}


//================================================
// file opening test
function readImage() {
	var preview = document.getElementById('tempImg');
	var file    = document.querySelector('input[type=file]').files[0];
	var reader  = new FileReader();

	reader.addEventListener("load", function () {
	preview.src = reader.result;
	console.log(preview.src)
	}, false);

	if (file) {
	reader.readAsDataURL(file);
	}
}
