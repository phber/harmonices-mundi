import * as THREE from "three";

export default class Planet {
  constructor(name, radius, textureFile, dist, density, color, vib) {
    this.name = name;
    this.radius = radius;
    this.textureFile = textureFile;
    this.instr = new Tone.Synth().toDestination();
    this.instr.volume.value = - 100;
    this.vibrato = new Tone.Vibrato(vib, density).toDestination();
    this.instr.connect(this.vibrato);
    this.dist = dist;
    this.color = color;
    this.notes = [];
    this.index = -1;
    this.muted = false;
  }

  getMesh() {
    if (this.mesh === undefined || this.mesh === null) {
      const geometry = new THREE.SphereGeometry(this.radius);
      const texture = new THREE.TextureLoader().load(this.textureFile);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      this.mesh = new THREE.Mesh(geometry, material); 
      var spriteMaterial = new THREE.SpriteMaterial( 
      { 
        map: new THREE.TextureLoader().load( './public/glow.png' ), 
        color: this.color, 
        transparent: true, 
        blending: THREE.AdditiveBlending
      });
      this.sprite = new THREE.Sprite( spriteMaterial );
      this.mesh.add(this.sprite); // this centers the glow at the mesh
    }
    return this.mesh;
  }
}
