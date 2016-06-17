function RGBtoHSV(r,g,b){
	var r=r/255;
	var g=g/255;
	var b=b/255;
	max=Math.max(r,g,b);
	min=Math.min(r,g,b);
	delta=max-min;
	v=max;
	var h=0;
	if(max==r){
		mod=((g-b)/delta) % 6;
		h=60*mod;
	}else if(max==g){
		mod=((b-r)/delta) +2;
		h=60*mod;
	}else if(max==b){
		mod=((r-g)/delta) +4;
		h=60*mod;
	}
	s=(max==0) ? 0 : (delta/max);
	return {h:h,s:s,v:v}
}
function initThreeJS(){
	threediv=document.getElementById("three");
	threediv.width=640;
	threediv.height=480;
	renderer=new THREE.WebGLRenderer();
  	renderer.autoClear = false;
  	renderer.setSize(640,480); 
	camera=new THREE.PerspectiveCamera(45,threediv.width/threediv.height,.1,2000),videoCamera=new THREE.Camera();
	document.getElementById("three").appendChild(renderer.domElement);
	scene=new THREE.Scene(),videoScene=new THREE.Scene();	
	// MARKER TRACKING
	geometry=new THREE.PlaneGeometry(30,30);
	material=new THREE.MeshBasicMaterial();
	mesh=new THREE.Mesh(geometry,material);
	mesh.position.z=-400;
	mesh.visible=false;
	scene.add(mesh);

	//ELEMENT VIDEO
  	canvas=document.createElement("canvas");
  	canvas.width=threediv.width;
  	canvas.height=threediv.height;
    context = canvas.getContext('2d');
    video=new THREEx.WebcamTexture(canvas.width,canvas.height);
	textureVideo=new THREE.Texture(canvas);
	textureVideo.minFilter = THREE.LinearFilter;
	textureVideo.magFilter = THREE.LinearFilter;
	materialVideo = new THREE.MeshBasicMaterial( { map: textureVideo, depthTest: false, depthWrite: false} );//new THREE.MeshBasicMaterial( { map: textura, overdraw: true, side:THREE.DoubleSide } );     
	var geometryVideo = new THREE.PlaneGeometry(2,2,0.0);
	var videoElem = new THREE.Mesh( geometryVideo, materialVideo );
	videoElem.scale.x=-1;
	videoElem.material.side = THREE.DoubleSide;  
	videoScene.add(videoElem);
	trackingInit();
	loop();
}

function rendering(){
	renderer.clear()
	renderer.render(videoScene,videoCamera);
	renderer.clearDepth();
	renderer.render(scene,camera);
	renderer.clearDepth();
}

//Debo de abrir gimp y sacar el rgb color del recuadro que imprimi, y con el hsv, buscar
//el rango de colores de verde (LISTO)
function loop(){
	context.drawImage(video.video,0,0,canvas.width,canvas.height);
	canvas.changed=true;
	materialVideo.map.needsUpdate=true;
	rendering();
	requestAnimationFrame(loop);
}
function trackingInit(){
      tracking.ColorTracker.registerColor('green', function(r, g, b) {
        colors=RGBtoHSV(r,g,b);           
        //Range of color green
        if ((colors["h"]<=140 && colors["h"]>=96) && (colors["s"]<=.97 && colors["s"]>=.40) &&(colors["v"]<=1 && colors["v"]>=.52)) {
          return true;
        }
        return false;
      });
      var tracker = new tracking.ColorTracker(["green"]);
      tracking.track(canvas, tracker, { camera: true,context:context });
      tracker.on('track', function(event) {
        event.data.forEach(function(rect) {
          if (rect.color === 'custom') {
            rect.color = tracker.customColor;
          }
          mesh.position.x=rect.x;
          mesh.position.y=rect.y;
          mesh.visible=true;
          console.log("Detect something "+rect.x+" "+rect.y);
          context.strokeStyle = rect.color;
          context.strokeRect(rect.x, rect.y, rect.width, rect.height);
          context.font = '11px Helvetica';
          context.fillStyle = "#fff";
          context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
          context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
        });
      });
}