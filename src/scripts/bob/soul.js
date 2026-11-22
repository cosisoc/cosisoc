// Bobs Seele: Leuchtkugel im Körper + inneres Leuchten, Gummi-Rand und farbiger Rand.
// Übersetzt aus dem Unity-Shader Bob/GlowClayV2 (Werte aus M_Body.mat) und BlobSoul.cs.
import { Vector3, Color } from 'three';

export function addSoulGlow(material) {
  const u = {
    uSoulPos: { value: new Vector3(0, 0.8, 0) },
    uGlowColor: { value: new Color(0.2, 0.85, 0.9) },
    uGlow: { value: 0 }, // 0 = Seele aus (graues Bob), 1 = leuchtet
    uTime: { value: 0 },
    uKeyDir: { value: new Vector3(-0.5, 0.8, 0.6).normalize() },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', `attribute float _thickness;
varying float vThick; varying vec3 vWPos; varying vec3 vWNorm;
void main() {`)
      .replace('#include <project_vertex>', `#include <project_vertex>
vThick = _thickness;
vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vWNorm = normalize(mat3(modelMatrix) * objectNormal);`);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform vec3 uSoulPos; uniform vec3 uGlowColor; uniform float uGlow; uniform float uTime; uniform vec3 uKeyDir;
varying float vThick; varying vec3 vWPos; varying vec3 vWNorm;
void main() {`)
      .replace('#include <opaque_fragment>', `${SOUL_GLSL}
#include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => 'bob-soul';
  return u;
}

const SOUL_GLSL = /* glsl */ `
{
  vec3 base = diffuseColor.rgb;
  vec3 N = normalize(vWNorm);
  vec3 V = normalize(cameraPosition - vWPos);
  float thick = smoothstep(0.15, 0.95, vThick);
  float facing = clamp(dot(N, V), 0.0, 1.0);
  float phase = 0.0;
  float w = uTime * 6.2831853 / 4.2 + phase;
  float breath = 1.0 + 0.18 * sin(w);
  float glowLum = max(max(uGlowColor.r, uGlowColor.g), uGlowColor.b);

  // inneres Leuchten: dort, wo Bob dick ist und zur Kamera zeigt
  float core = smoothstep(0.0, 1.0, pow(facing, 1.6)) * mix(1.0, thick, 0.8);
  float texShade = mix(1.0, clamp(dot(base, vec3(0.299, 0.587, 0.114)) * 5.0, 0.0, 1.0), 0.6);
  vec3 coreCol = mix(uGlowColor, vec3(glowLum), 0.1 * core);
  outgoingLight += coreCol * uGlow * mix(0.03, 0.55, core) * texShade * breath * 0.22;

  // Volumen: Licht- und Schattenseite, Bauch unten dunkler
  float wrapL = clamp((dot(N, uKeyDir) + 0.35) / 1.35, 0.0, 1.0);
  float hgt = clamp(vWPos.y / 0.7, 0.0, 1.0);
  outgoingLight *= mix(0.55, 1.16, wrapL) * mix(0.55, 1.0, smoothstep(0.0, 1.0, hgt));

  // Seele: pulsierende Kugel, entlang des Sichtstrahls angenähert
  vec3 rd = -V;
  float tt = max(0.0, dot(uSoulPos - vWPos, rd));
  float dist = length(vWPos + rd * tt - uSoulPos);
  float beat = 0.6 * sin(w) + 0.4 * sin(2.0 * w + 1.3);
  float R = 0.28 * (1.0 + 0.18 * 0.35 * beat);
  float orbCore = exp(-(dist * dist) / (R * R) * 1.6);
  float orbHalo = exp(-dist / (R * 2.6)) * 0.45;
  float absorb = exp(-tt * 2.2);
  float inner = exp(-length(vWPos - uSoulPos) / 0.35) * 0.4;
  vec3 hueN = uGlowColor / max(glowLum, 0.001);
  float hueL = dot(hueN, vec3(0.299, 0.587, 0.114));
  hueN = max(vec3(0.0), hueL + (hueN - hueL) * 1.25);
  float hot = orbCore * orbCore * orbCore;
  vec3 soulCore = mix(hueN, mix(hueN, vec3(1.0), 0.7), hot * 0.3);
  vec3 soul = (soulCore * orbCore + hueN * orbHalo) * absorb * 1.9 * glowLum + uGlowColor * inner * mix(0.6, 1.0, thick);
  outgoingLight += soul * uGlow * (1.0 + 0.35 * beat);

  // Gummi: milchige, hellere Ränder; farbiger Rand
  float fres = pow(1.0 - facing, 2.5);
  vec3 milky = base * 0.55 + base * glowLum * uGlow * 0.15;
  outgoingLight = mix(outgoingLight, max(outgoingLight, milky), fres * 0.65);
  outgoingLight += (uGlowColor * uGlow * 0.5 + vec3(0.12, 0.14, 0.2)) * pow(1.0 - facing, 3.5) * 0.6;
}`;

// Bewegung der Seele: sitzt zwischen spine und chest, treibt langsam umher und folgt Bewegungen federnd.
export class SoulMotion {
  constructor(spine, chest) {
    this.spine = spine; this.chest = chest;
    this.pos = new Vector3(); this.vel = new Vector3(); this.started = false;
    this.a = new Vector3(); this.b = new Vector3(); this.target = new Vector3();
  }
  update(dt, t) {
    this.spine.getWorldPosition(this.a); this.chest.getWorldPosition(this.b);
    this.target.lerpVectors(this.a, this.b, 0.45);
    this.target.z += 0.04; // etwas nach vorne
    this.target.x += Math.sin(t * 0.3 * 6.28) * 0.06 * 0.5 + Math.sin(t * 0.47 * 6.28 + 1.7) * 0.03;
    this.target.y += Math.sin(t * 0.37 * 6.28 + 0.6) * 0.04;
    if (!this.started) { this.pos.copy(this.target); this.started = true; return this.pos; }
    // gedämpfte Feder (Trägheit ~0.12 s), Abstand höchstens 0.12 m
    const k = 1 / (0.12 * 0.12), d = 2 / 0.12;
    this.vel.addScaledVector(this.a.subVectors(this.target, this.pos), k * dt).multiplyScalar(Math.max(0, 1 - d * dt));
    this.pos.addScaledVector(this.vel, dt);
    const off = this.a.subVectors(this.pos, this.target);
    if (off.length() > 0.12) this.pos.copy(this.target).add(off.setLength(0.12));
    return this.pos;
  }
}
