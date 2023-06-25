import * as THREE from "three";
import SceneInit from "./lib/SceneInit.js";
import Planet from "./lib/Planet.js";
//import data from './public/planet_data.json' assert { type: 'json' };
import * as dat from './dat.gui.module.js';

async function getJSON() {
  const response = await fetch("./public/data.json");
  return await response.json();
}

const data = await getJSON();

var playbtn = document.getElementById('tunebtn');
playbtn.addEventListener('click', () => startanimation(), {passive: true});

document.addEventListener("visibilitychange", function() {
  if (document.hidden){
      Tone.Master.mute = true;
  } else {
      Tone.Master.mute = false;
  }
});

let solarscene = new SceneInit();
solarscene.initScene();
solarscene.animate();

const gui = new dat.GUI();

// Add stars
const particlesGeometry = new THREE.BufferGeometry(); // Geometry for the stars
const particlesCount = 15000; // number of particles to be created

const vertices = new Float32Array(particlesCount); // Float32Array is an array of 32-bit floats. This is used to represent an array of vertices. (we have 3 values for each vertex - coordinates x, y, z)

// Loop through all the vertices and set their random position
for (let i = 0; i < particlesCount; i++) {
  vertices[i] = (Math.random() - 0.5) * 10000; // -0.5 to get the range from -0.5 to 0.5 than * 100 to get a range from -50 to 50
}

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(vertices, 3) // 3 values for each vertex (x, y, z)
  // Check the documentation for more info about this.
);

// Texture
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('./public/star.png'); // Add a texture to the particles

// Material
const particlesMaterial = new THREE.PointsMaterial({
  map: particleTexture, // Texture
  size: 0.5, // Size of the particles
  sizeAttenuation: true, // size of the particle will be smaller as it gets further away from the camera, and if it's closer to the camera, it will be bigger
});

const stars = new THREE.Points(particlesGeometry, particlesMaterial);
solarscene.scene.add(stars);

const sunGeometry = new THREE.SphereGeometry(30);
const sunTexture = new THREE.TextureLoader().load("./public/sun.jpeg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
const solarSystem = new THREE.Group();
solarSystem.add(sunMesh);
solarscene.scene.add(solarSystem);

const mercury = new Planet('mercury', 3, "./public/mercury.jpg", 'A6', 0.4, 0.02, 'royalblue');
const mercuryMesh = mercury.getMesh();

const venus = new Planet('venus', 8, "./public/venus.jpeg", 'F5', 0.7, 0.05, 'seagreen');
const venusMesh = venus.getMesh();

const earth = new Planet('earth', 9, "./public/earth.jpeg", '', 1, 1, '');
const earthMesh = earth.getMesh();

const mars = new Planet('mars', 4, "./public/mars.jpeg", 'D#6', 1.52, 0.29, 'crimson');
const marsMesh = mars.getMesh();

const jupiter = new Planet('jupiter', 100, "./public/jupiter.jpg", 'A#1', 5.2, 0.76, 'pink');
const jupiterMesh = jupiter.getMesh();


const saturn = new Planet('saturn', 83, "./public/saturn.jpg", 'C#2', 9.6, 0.88, 'peru');
const saturnMesh = saturn.getMesh();

const uranus = new Planet('uranus', 36, "./public/uranus.jpg", 'E3', 19.2, 0.77, 'darkseagreen');
const uranusMesh = uranus.getMesh();

const neptune = new Planet('neptune', 35, "./public/neptune.jpg", 'F3', 30, 0.7, 'lightskyblue');
const neptuneMesh = neptune.getMesh();

const planets = [mercury, venus, earth, mars, saturn, jupiter, uranus, neptune];
solarSystem.add(mercuryMesh, marsMesh, earthMesh, venusMesh, saturnMesh, jupiterMesh, uranusMesh, neptuneMesh);

function startanimation() {
	Tone.start();
  Tone.Master.volume.value = -20;
  console.log('Tone.js audio started.');
  playbtn.style.display = 'none';
  var i = 0;
  for (const p of planets){
    if (p.pitch)
      p.instr.triggerAttack(p.pitch, (i+1)*0.3, 1);
    i += 1;
  } 
  animate();
}   

// Start animation 

var distscale = 150; // Visual distance between planets
var i = 0; // Array index
var clock = new THREE.Clock();
var passed = 0; // Passed time since last i+1
var date = new Date(2023, 1, 1);
var controls = new function() { // Dat GUI controls
  this.speed = 30; 
}
gui.add(controls, 'speed', 10, 100).name('Days per second');
const animate = () => {
  sunMesh.rotation.y += 0.01;
  var delta = clock.getDelta();
  for (const p of planets){
    p.getMesh().position.x = data[p.name].x[i]*distscale;
    p.getMesh().position.y = data[p.name].y[i]*distscale;
    p.getMesh().position.z = data[p.name].z[i]*distscale;
    if (p.name == 'earth')
      continue; 
    p.instr.volume.value = - data[p.name].dist_norm[i] * 30;
    p.vibrato.frequency.value = data[p.name].vel_norm[i]*10;

    p.spriteScale = 10*p.radius*(1-data[p.name].dist_norm[i]);
    p.sprite.scale.set(p.spriteScale, p.spriteScale, 1);
  }
  passed += delta;
  if (passed >= 1/controls.speed){ 
    i += 1;
    passed = 0;
    date.setDate(date.getDate() + 1);
  }
  if (i == data['mercury'].x.length - 1){ 
    i = 0;
    date = new Date(2023, 1, 1);
  }
  document.getElementById("date").innerHTML = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  requestAnimationFrame(animate);
};


