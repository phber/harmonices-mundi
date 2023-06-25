import * as THREE from "three";

export default class Planet {
  constructor(name, radius, textureFile, pitch, dist, density, color) {
    this.name = name;
    this.radius = radius;
    this.textureFile = textureFile;
    this.instr = new Tone.Synth().toDestination();
    this.density = density;
    this.vibrato = new Tone.Vibrato(0, this.density).toDestination();
    this.instr.chain(this.vibrato);
    this.pitch = pitch;
    this.dist = dist;
    this.passed = 0;
    this.color = color;
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
      this.sprite.scale.set(this.spriteScale, this.spriteScale, 1);
      this.mesh.add(this.sprite); // this centers the glow at the mesh
    }
    return this.mesh;
  }
}
