import * as THREE from "three";
import SceneInit from "./lib/SceneInit.js";
import Planet from "./lib/Planet.js";
import Rotation from "./lib/Rotation.js";
//import * as dat from './dat.gui.module.js';
import data from './data4.json' assert { type: 'json' };


document.querySelector('button')?.addEventListener('click', async () => {
	await Tone.start();
	console.log('audio is ready');
  animate();
})
// TODO: Understand this code later.
let solarscene = new SceneInit();
solarscene.initScene();
solarscene.animate();

const sunGeometry = new THREE.SphereGeometry(30);
const sunTexture = new THREE.TextureLoader().load("./public/sun.jpeg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
const solarSystem = new THREE.Group();
solarSystem.add(sunMesh);
solarscene.scene.add(solarSystem);

const mercury = new   Planet('mercury', 3, "./public/mercury.jpg", 'A6', 1.4);
mercury.notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
const mercuryMesh = mercury.getMesh();

const venus = new Planet('venus', 8, "./public/venus.jpeg", 'F5', 1.7);
venus.notes = ['E5'];
const venusMesh = venus.getMesh();

const earth = new Planet('earth', 9, "./public/earth.jpeg", '', 0);
const earthMesh = earth.getMesh();
earth.notes = ['G4', 'G#4'];

const mars = new Planet('mars', 4, "./public/mars.jpeg", 'D#6', 2.7);
const marsMesh = mars.getMesh();
mars.notes = ['F2', 'G3', 'A3', 'A#3', 'C3'];

const saturn = new Planet('saturn', 83, "./public/mars.jpeg", 'C#2', 11);
const saturnMesh = saturn.getMesh();
saturn.notes = ['G2', 'A2', 'A2'];

const jupiter = new Planet('jupiter', 100, "./public/mars.jpeg", 'A#1',61);
const jupiterMesh = jupiter.getMesh();
jupiter.notes = ['G2', 'A2', 'A#2'];



const planets = [mercury, venus, earth, mars, saturn, jupiter];
solarSystem.add(mercuryMesh, marsMesh, earthMesh, venusMesh, saturnMesh, jupiterMesh);

var distscale = 200;
var i = 0;
var clock = new THREE.Clock();
var passed = 0;
const animate = () => {
  sunMesh.rotation.y += 0.01;
  var delta = clock.getDelta();
  for (const p of planets){
    var name = p.name;
    if (!name) continue
    
    var vel = Math.round(data[name].vel[i]);
    if (name != 'earth') {

    p.instr.volume.value = - data[name].dist_norm[i] * 60;

    }
  if (p.passed >= p.dist && p.pitch)
{
  const now = Tone.now();
  p.instr.triggerAttackRelease(p.pitch, p.dist, now, p.radius/100);
  p.spriteScale = p.radius*5;
  p.passed = 0;
}
else p.passed += delta;
  p.getMesh().position.x = data[name].x[i]*distscale;
  p.getMesh().position.y = data[name].y[i]*distscale;
  p.getMesh().position.z = data[name].z[i]*distscale;
  if (p.spriteScale > 0)
  p.spriteScale -= p.radius/5;
  p.sprite.scale.set(p.spriteScale, p.spriteScale, 1);

  }
  
  i += 1
  if (i==600) i=0;

  requestAnimationFrame(animate);
  
};


