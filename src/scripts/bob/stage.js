// Licht und Bodenschein für den Bob-Viewer. Hintergrund bleibt durchsichtig (weiße Seite scheint durch).
import * as THREE from 'three';

export const KEY_DIR = new THREE.Vector3(-0.5, 0.8, 0.6).normalize();

// Runder Fleck auf dem Boden: dunkler Kontaktschatten oder farbiger Schein der Seele
function floorSpot(size, additive) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uAmount: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.0) * uAmount;
      gl_FragColor = vec4(uColor, a); }`,
    transparent: true, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.renderOrder = 1;
  return m;
}

export function setupScene(renderer, scene, camera, stageGltf) {
  const withStage = !!stageGltf;
  const key = new THREE.DirectionalLight(0xdfe6ff, withStage ? 1.6 : 2.2);
  key.position.copy(KEY_DIR).multiplyScalar(5);
  scene.add(key, new THREE.HemisphereLight(0x9aa6ff, withStage ? 0x140c1c : 0x777777, withStage ? 0.7 : 1.4));

  const shadow = floorSpot(1.5, false); shadow.material.uniforms.uAmount.value = withStage ? 0.6 : 0.35;
  const glow = floorSpot(2.6, true);
  scene.add(shadow, glow);
  const soulLight = new THREE.PointLight(0xffffff, 0, 3.5, 2);
  scene.add(soulLight);

  if (withStage) {
    scene.add(stageGltf.scene);
    // Neon etwas zurücknehmen, sonst wird das Schild weiß statt pink
    stageGltf.scene.traverse((o) => { if (o.material?.emissiveIntensity > 1) o.material.emissiveIntensity *= 0.35; });
    // Farbiges Licht vom Neon-Schild (pink) und von links hinten (türkis), wie in der Gasse
    const pink = new THREE.PointLight(0xff4fb0, 3, 4, 2); pink.position.set(0.6, 1.5, -0.9);
    const cyan = new THREE.PointLight(0x35d8ff, 5, 5, 2); cyan.position.set(-1.6, 1.4, -0.8);
    scene.add(pink, cyan);
  }

  return {
    // Seele: Farbe und Stärke auf Bodenschein und Punktlicht übertragen
    setSoul(pos, color, amount) {
      glow.material.uniforms.uColor.value.copy(color);
      glow.material.uniforms.uAmount.value = amount * (withStage ? 0.55 : 0.0);
      soulLight.position.copy(pos); soulLight.color.copy(color);
      soulLight.intensity = amount * (withStage ? 1.6 : 0);
    },
    render() { renderer.render(scene, camera); },
  };
}
