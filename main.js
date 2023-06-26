import * as THREE from "three";
import SceneInit from "./lib/SceneInit.js";
import Planet from "./lib/Planet.js";
//import data from './public/planet_data.json' assert { type: 'json' };
import * as dat from './dat.gui.module.js';

function getJSON() {
  var obj;
fetch("./public/data.json")
  .then(res => res.json())
  .then(data => {
    obj = data;
   })
  .then(() => {
    return obj;
   });
}

const data = getJSON();

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

const sunGeometry = new THREE.SphereGeometry(150);
const sunTexture = new THREE.TextureLoader().load("./public/sun.jpeg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
const solarSystem = new THREE.Group();
solarSystem.add(sunMesh);
solarscene.scene.add(solarSystem);

const mercury = new Planet('mercury', 3, "./public/mercury.jpg", 0.4, 0.02, 'purple', 1.5);
const mercuryMesh = mercury.getMesh();
mercury.notes = ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7', 'C8', 'D8', 'E8'];


const venus = new Planet('venus', 8, "./public/venus.jpeg", 0.7, 0.05, 'seagreen', 2.6);
const venusMesh = venus.getMesh();
venus.notes = ['E6', 'E6', 'E6', 'E6'];


const earth = new Planet('earth', 9, "./public/earth.jpeg", 1, 1, 'royalblue', 1);
const earthMesh = earth.getMesh();
earth.notes = ['G6', 'G#6', 'A6'];
earth.sprite.scale.set(50, 50, 1);

const moon = new Planet('moon', 2, "./public/uranus.jpg", 1, 0.29, 'grey', 0.72);
const moonMesh = moon.getMesh();
moon.notes = ['G4', 'A4', 'B4', 'C4'];

const mars = new Planet('mars', 4, "./public/mars.jpeg", 1.52, 0.29, 'crimson', 0.7);
const marsMesh = mars.getMesh();
mars.notes = ['F3', 'G3', 'A3', 'A#3', 'C5'];

const jupiter = new Planet('jupiter', 100, "./public/jupiter.jpg", 5.2, 0.76, 'pink', 0.57);
const jupiterMesh = jupiter.getMesh();
jupiter.notes = ['B2', 'C3', 'C#3'];


const saturn = new Planet('saturn', 83, "./public/saturn.jpg", 9.6, 0.88, 'peru', 0.46);
const saturnMesh = saturn.getMesh();
saturn.notes = ['G1', 'A1', 'B1'];

//const uranus = new Planet('uranus', 36, "./public/uranus.jpg", 'E3', 19.2, 0.77, 'darkseagreen');
//const uranusMesh = uranus.getMesh();

//const neptune = new Planet('neptune', 35, "./public/neptune.jpg", 'F3', 30, 0.7, 'lightskyblue');
//const neptuneMesh = neptune.getMesh();

const planets = [mercury, venus, mars, saturn, jupiter, earth, moon];
solarSystem.add(mercuryMesh, marsMesh, earthMesh, venusMesh, saturnMesh, jupiterMesh);


// Setup animation 

var distscale = 700; // Visual distance between planets
var i = 0; // Array index
var clock = new THREE.Clock();
var passed = 0; // Passed time since last i+1
var date = new Date(2023, 1, 1);

// Dat GUI controls
var controls = new function() { 
  this.speed = 30; 
}
const muteFolder = gui.addFolder('Planet sounds')
muteFolder.add(mercury, 'muted').name('Mercury');
muteFolder.add(venus, 'muted').name('Venus');
muteFolder.add(mars, 'muted').name('Mars');
muteFolder.add(earth, 'muted').name('Earth');
muteFolder.add(moon, 'muted').name('Moon');
muteFolder.add(jupiter, 'muted').name('Jupiter');
muteFolder.add(saturn, 'muted').name('Saturn');

gui.add(controls, 'speed', 10, 100).name('Days per second');

const animate = () => {
  sunMesh.rotation.y += 0.01;
  var delta = clock.getDelta();
  for (const p of planets){
    p.getMesh().position.x = data[p.name].x[i]*distscale;
    p.getMesh().position.y = data[p.name].y[i]*distscale;
    p.getMesh().position.z = data[p.name].z[i]*distscale;
    var pidx = Math.round(data[p.name].vel_norm[i]*(p.notes.length-1));
    if (p.index != pidx ){       
      p.instr.triggerRelease();
      p.instr.triggerAttack(p.notes[pidx], 0, Math.sqrt(p.radius)/5);
      p.index = pidx;
    }
    if (p.muted){     
      p.instr.volume.value = -100;
      continue;
    }
    if (p.name != 'earth'){ 
      p.instr.volume.value = - 5 - data[p.name].dist_norm[i] * 50;
      p.spriteScale = 10*p.radius*(1-data[p.name].dist_norm[i]);
      p.sprite.scale.set(p.spriteScale, p.spriteScale, 1);
    }
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

// Start animation
const delay = ms => new Promise(res => setTimeout(res, ms));

const startanimation = async () => {
  (async() => {
          while(!window.hasOwnProperty("animate")) 
          await new Promise(resolve => setTimeout(resolve, 500));
  console.log("variable is defined");
  })();    
  Tone.start();
  Tone.Master.volume.value = -10;
  console.log('Tone.js audio started.');
  playbtn.style.display = 'none';
  document.getElementById('loading-text').style.display = 'block';
  await delay(1000);
  try {
    animate();
    document.getElementById('loading-text').style.display = 'none';
  }
  catch (error) {
    console.error(error);
    console.log("Trying to start animation again...");
    await delay(3000);
    animate();
    document.getElementById('loading-text').style.display = 'none';
  }
};

var playbtn = document.getElementById('tunebtn');
playbtn.addEventListener('click', () => startanimation(), {passive: true});
playbtn.style.display = 'block';


