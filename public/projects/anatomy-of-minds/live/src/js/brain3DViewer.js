/**
 * Brain 3D Viewer
 * Lädt und rendert 3D-Gehirnmodelle mit Three.js
 * MIT TRANSPARENTEM HINTERGRUND - liegt direkt auf dem Background-PNG
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Brain3DViewer {
    constructor(containerElement) {
        this.container = containerElement;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this._desiredRotation = 0; // target rotation in degrees
        this._currentRotation = 0; // actual current rotation in degrees (for smooth interpolation)
        this.animationId = null;
        this._meshes = {}; // registry of meshes by name for easy access
        this._userScale = 1; // additional uniform multiplier controlled by API
        this._baseScale = 1; // base scale computed from model bounds
        this._activeSequence = null; // current active sequence name (e.g., 'ant_emotion_2')

        // Brain area highlighting configuration for *_2 sequences
        // Each brain part gets ONE consistent color across ALL sequences
        
        // Fixed color assignments for consistency
        this.brainPartColors = {
            // Human brain parts (by number)
            human: {
                1: '#FF4444', // Amygdala - Bright Red
                2: '#44FF44', // Cerebellum - Bright Green
                3: '#4444FF', // Hippocampus - Bright Blue
                4: '#FFAA00', // Right Hemisphere - Orange
                5: '#FF00FF', // Brainstem - Magenta
                6: '#FFFF00'  // Left Hemisphere - Yellow
            },
            // Ant brain parts (by keyword)
            ant: {
                'ALO': '#FF4444',      // Antennal Lobe Outer - Bright Red
                'ALT': '#FF6666',      // Antennal Lobe - Light Red
                'AMMC': '#FF8888',     // Antennal Motor - Lighter Red
                'Calyx': '#4444FF',    // Calyx (Mushroom) - Bright Blue
                'Ped': '#6666FF',      // Pedunculus (Mushroom) - Light Blue
                'Lobula': '#44FF44',   // Lobula (Optic) - Bright Green
                'Lamina': '#66FF66',   // Lamina (Optic) - Light Green
                'Medula': '#88FF88'    // Medula (Optic) - Lighter Green
            }
        };

        this.highlightMapping = {
            'ant_emotion_2': {
                // Antennal lobes, Mushroom bodies
                patterns: [
                    { keywords: ['ALO', 'ALT', 'AMMC'], colorKey: 'ant' },
                    { keywords: ['Calyx', 'Ped'], colorKey: 'ant' }
                ]
            },
            'ant_intelligence_2': {
                patterns: [
                    { keywords: ['ALO', 'ALT', 'AMMC'], colorKey: 'ant' },
                    { keywords: ['Calyx', 'Ped'], colorKey: 'ant' }
                ]
            },
            'ant_environment_2': {
                patterns: [
                    { keywords: ['ALO', 'ALT', 'AMMC'], colorKey: 'ant' },
                    { keywords: ['Lobula', 'Lamina', 'Medula'], colorKey: 'ant' },
                    { keywords: ['Calyx', 'Ped'], colorKey: 'ant' }
                ]
            },
            'human_intelligence_2': {
                // Prefrontal cortex (4,6) + Hippocampus (3)
                patterns: [
                    { partNumbers: [4, 6], colorKey: 'human', label: 'Prefrontal cortex' },
                    { partNumbers: [3], colorKey: 'human', label: 'Hippocampus' }
                ]
            },
            'human_emotion_2': {
                // Amygdala (1) + Limbic system (3,5) + Prefrontal cortex (4,6)
                // Only these 3 regions should be highlighted
                patterns: [
                    { partNumbers: [1], colorKey: 'human', label: 'Amygdala' },
                    { partNumbers: [5], colorKey: 'human', label: 'Limbic system (Brainstem)' },
                    { partNumbers: [3], colorKey: 'human', label: 'Limbic system (Hippocampus)' }
                ]
            },
            'human_environment_2': {
                // Occipital cortex (4,6) + Hippocampus (3) - NO Cerebellum
                // Prefrontal/Temporal are part of the hemispheres (4,6)
                patterns: [
                    { partNumbers: [4, 6], colorKey: 'human', label: 'Occipital & Temporal cortex' },
                    { partNumbers: [3], colorKey: 'human', label: 'Hippocampus' }
                ]
            }
        };

        this.init();
    }

    /**
     * Set desired model rotation in degrees around Y.
     * If smooth=true, interpolates smoothly. If false, jumps immediately.
     */
    setRotation(deg, smooth = true) {
        this._desiredRotation = deg || 0;
        if (!smooth && this.model) {
            // Immediate jump
            this._currentRotation = this._desiredRotation;
            const rotationTarget = this._pivot || this.model;
            rotationTarget.rotation.y = (this._currentRotation * Math.PI) / 180;
        }
        // If smooth=true, animate() will interpolate _currentRotation toward _desiredRotation
    }

    /**
     * Enable or disable zoom capability
     */
    setZoomEnabled(enabled) {
        if (this.controls) {
            this.controls.enableZoom = enabled;
        }
    }

    /**
     * Set a uniform scale multiplier for the loaded model.
     * Use values >1 to enlarge, <1 to shrink. Applies immediately if model present.
     */
    setUniformScale(multiplier) {
        const m = Number(multiplier) || 1;
        this._userScale = m;
        if (!this.model) return;
        try {
            // apply combined scale: baseScale (computed at load) * user multiplier
            const target = (this._baseScale || 1) * this._userScale;
            this.model.scale.setScalar(target);

            // After scaling, recenter and reposition camera so model stays visible
            try {
                const box = new THREE.Box3().setFromObject(this.model);
                const sphere = new THREE.Sphere();
                box.getBoundingSphere(sphere);
                const radius = sphere.radius || Math.max(box.getSize(new THREE.Vector3()).toArray()) / 2;
                const distance = Math.max(radius * 2.5, 1.5);

                // center model at origin
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center);

                if (this._pivot) {
                    // keep pivot at origin
                    this._pivot.position.set(0, 0, 0);
                }

                if (this.camera) {
                    this.camera.position.set(0, 0, distance);
                    this.camera.near = Math.max(0.1, distance / 1000);
                    this.camera.far = Math.max(1000, distance * 10);
                    this.camera.updateProjectionMatrix();
                }
                if (this.controls) {
                    this.controls.target.set(0, 0, 0);
                    this.controls.update();
                }
            } catch (e) {
                console.warn('Failed to recalc camera after scale', e);
            }
        } catch (e) {
            console.warn('setUniformScale failed', e);
        }
    }

    init() {
        this.scene = new THREE.Scene();

        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        this.camera.position.set(0, 0, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);

        // Canvas direkt im Container - einfach und sauber
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        
        this.container.style.position = this.container.style.position || 'relative';
        this.container.style.overflow = 'visible';
        this.container.appendChild(this.renderer.domElement);

        // Beleuchtung
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dir1.position.set(5, 5, 5);
        this.scene.add(dir1);
        const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dir2.position.set(-5, -5, -5);
        this.scene.add(dir2);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.autoRotate = false;

        // Continuous rotation state
        this._lastReceivedRotation = null;
        this._rotationTimeout = null;
        this._currentRotationVelocity = 0; // Current rotation speed in radians per frame
        this._targetRotationVelocity = 0; // Target rotation speed
        this._rotationAcceleration = 0.001; // How quickly to ramp up/down

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();

        console.log('3D Viewer initialisiert (transparent)');
    }

    loadModel(modelPath) {
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                // Viewer wurde inzwischen entfernt (z. B. Figur schnell umgesetzt): Ergebnis verwerfen
                if (!this.scene) return;
                // Altes Modell entfernen
                if (this._pivot) {
                    this.scene.remove(this._pivot);
                    this._pivot = null;
                }
                if (this.model) {
                    this.scene.remove(this.model);
                    this.model = null;
                }

                this.model = gltf.scene;

                // Bounding Box berechnen und Model skalieren
                let box = new THREE.Box3().setFromObject(this.model);
                let size = box.getSize(new THREE.Vector3());
                let center = box.getCenter(new THREE.Vector3());
                
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const scale = 3 / maxDim;
                // save base scale so user multiplier can be applied later
                this._baseScale = scale;
                this.model.scale.setScalar(scale * (this._userScale || 1));

                // Nach Skalierung neu berechnen
                box = new THREE.Box3().setFromObject(this.model);
                center = box.getCenter(new THREE.Vector3());
                size = box.getSize(new THREE.Vector3());

                // Model zentrieren (Position auf 0,0,0 minus Center)
                this.model.position.sub(center);

                // Pivot-Gruppe erstellen für Rotation
                this._pivot = new THREE.Group();
                this._pivot.add(this.model);
                this.scene.add(this._pivot);

                // Gespeicherte Rotation anwenden
                if (this._desiredRotation) {
                    // Initialize current rotation to desired on model load
                    this._currentRotation = this._desiredRotation;
                    this._pivot.rotation.y = (this._currentRotation * Math.PI) / 180;
                }

                // Kamera positionieren - nutze skalierte Größe
                const sphere = new THREE.Sphere();
                box.getBoundingSphere(sphere);
                const radius = sphere.radius || Math.max(size.x, size.y, size.z) / 2;
                const distance = radius * 2.5;
                
                this.camera.position.set(0, 0, distance);
                this.camera.lookAt(0, 0, 0);
                this.camera.near = distance / 100;
                this.camera.far = distance * 10;
                this.camera.updateProjectionMatrix();
                
                this.controls.target.set(0, 0, 0);
                this.controls.update();

                console.log(`Modell geladen: scale=${scale.toFixed(2)}, distance=${distance.toFixed(2)}`);

                // Meshes registrieren und Materialien vorbereiten
                this._meshes = {};
                let meshCount = 0;
                try {
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            meshCount++;
                            // Original Material speichern
                            if (!child.userData._origMaterial) {
                                child.userData._origMaterial = child.material;
                            }
                            
                            // Material doppelseitig machen
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach((m) => {
                                if (m) {
                                    m.side = THREE.DoubleSide;
                                    m.needsUpdate = true;
                                }
                            });
                            
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // Nach Name registrieren
                            const key = child.name || child.uuid;
                            this._meshes[key] = child;
                        }
                    });
                    console.log(`${meshCount} Meshes registriert`);
                } catch (e) {
                    console.warn('Mesh-Registrierung fehlgeschlagen', e);
                }

                // Callback für externe Handler
                if (this.onModelLoaded && typeof this.onModelLoaded === 'function') {
                    try {
                        this.onModelLoaded(this);
                    } catch (e) {
                        console.warn('onModelLoaded handler error', e);
                    }
                }
            },
            (xhr) => {
                if (xhr.total) {
                    console.log(`Laden: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
                }
            },
            (error) => {
                console.error('Fehler beim Laden des Modells:', error);
            }
        );
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Smoothly interpolate to target rotation velocity (for smooth start/stop)
        if (Math.abs(this._currentRotationVelocity - this._targetRotationVelocity) > 0.0001) {
            if (this._currentRotationVelocity < this._targetRotationVelocity) {
                this._currentRotationVelocity = Math.min(
                    this._targetRotationVelocity,
                    this._currentRotationVelocity + this._rotationAcceleration
                );
            } else {
                this._currentRotationVelocity = Math.max(
                    this._targetRotationVelocity,
                    this._currentRotationVelocity - this._rotationAcceleration
                );
            }
        }
        
        // Apply continuous rotation if velocity is non-zero
        if (Math.abs(this._currentRotationVelocity) > 0.0001 && this.model) {
            const rotationTarget = this._pivot || this.model;
            rotationTarget.rotation.y += this._currentRotationVelocity;
        }
        
        // Smooth interpolation for setRotation() calls (Arduino rotation updates)
        if (this.model) {
            // Compute delta with wrap-around
            let delta = this._desiredRotation - this._currentRotation;
            // Normalize to -180..180
            while (delta > 180) delta -= 360;
            while (delta < -180) delta += 360;
            
            const absDelta = Math.abs(delta);
            
            // Deadzone: if very close, snap immediately to avoid flicker
            if (absDelta < 0.3) {
                if (absDelta > 0.001) {
                    this._currentRotation = this._desiredRotation;
                    const rotationTarget = this._pivot || this.model;
                    rotationTarget.rotation.y = (this._currentRotation * Math.PI) / 180;
                }
            }
            // Smooth interpolation zone: smooth movement for visible changes
            else if (absDelta > 1.0) {
                // Lerp factor: 0.15 = smooth but responsive
                const lerpFactor = 0.15;
                this._currentRotation += delta * lerpFactor;
                
                // Normalize _currentRotation to 0..360
                this._currentRotation = ((this._currentRotation % 360) + 360) % 360;
                
                const rotationTarget = this._pivot || this.model;
                rotationTarget.rotation.y = (this._currentRotation * Math.PI) / 180;
            }
            // Middle zone (0.3° - 1.0°): slower lerp to prevent micro-jitter
            else {
                const lerpFactor = 0.08; // slower for small movements
                this._currentRotation += delta * lerpFactor;
                this._currentRotation = ((this._currentRotation % 360) + 360) % 360;
                const rotationTarget = this._pivot || this.model;
                rotationTarget.rotation.y = (this._currentRotation * Math.PI) / 180;
            }
        }
        
        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Returns an array of available part names (mesh names or uuids).
     */
    getPartNames() {
        return Object.keys(this._meshes || {});
    }

    /**
     * Debug helper: Log all mesh names for mapping configuration
     */
    debugMeshNames() {
        const names = this.getPartNames();
        console.log('='.repeat(50));
        console.log('🔍 DEBUG: Available Mesh Names');
        console.log('='.repeat(50));
        names.forEach((name, idx) => {
            console.log(`${idx + 1}. "${name}"`);
        });
        console.log('='.repeat(50));
        console.log(`Total: ${names.length} meshes`);
        return names;
    }

    /**
     * Color each brain part with a distinct, easily identifiable color for identification
     * Each part gets labeled with its color in the console
     */
    colorPartsForIdentification() {
        // Very distinct colors that are easy to identify
        const identificationColors = [
            { color: '#FF0000', name: 'ROT / RED' },
            { color: '#00FF00', name: 'GRÜN / GREEN' },
            { color: '#0000FF', name: 'BLAU / BLUE' },
            { color: '#FFFF00', name: 'GELB / YELLOW' },
            { color: '#FF00FF', name: 'MAGENTA / PINK' },
            { color: '#00FFFF', name: 'CYAN / TÜRKIS' }
        ];

        const parts = this.getPartNames();
        
        console.log('='.repeat(60));
        console.log('🎨 GEHIRN-TEILE IDENTIFIKATION');
        console.log('='.repeat(60));
        console.log('Mach jetzt Screenshots und sage mir welche Farbe wo ist!');
        console.log('='.repeat(60));
        
        parts.forEach((name, idx) => {
            const match = name.match(/Part[_\s]?(\d+)/i);
            if (match) {
                const partNum = parseInt(match[1], 10);
                const colorInfo = identificationColors[idx] || identificationColors[0];
                this.setPartColor(name, colorInfo.color, { force: true });
                console.log(`Teil ${partNum}: ${colorInfo.name} (${colorInfo.color})`);
            }
        });
        
        console.log('='.repeat(60));
        console.log('Sag mir dann z.B.: "Teil 1 ist vorne links (rot)"');
        console.log('='.repeat(60));
    }

    /**
     * Set color for a single named part. `color` may be a hex number or CSS string.
     */
    setPartColor(name, color, options = {}) {
        if (!this._meshes[name]) {
            console.warn('setPartColor: part not found', name);
            return false;
        }
        const mesh = this._meshes[name];
        if (!mesh) return false;
        // clone material so changes don't affect other instances
        try {
            let mat = mesh.material;
            if (Array.isArray(mat)) {
                mat = mat.map(m => m.clone());
                mesh.material = mat;
            } else {
                mesh.material = mat.clone();
            }

            const applyColor = (m) => {
                if (!m) return;
                // If textures (map) exist and force option provided, remove them so color shows
                if (options.force) {
                    try { m.map = null; } catch (e) {}
                    try { m.alphaMap = null; } catch (e) {}
                    try { m.envMap = null; } catch (e) {}
                    // make material more diffuse so flat color is visible
                    if ('metalness' in m) m.metalness = 0.1;
                    if ('roughness' in m) m.roughness = 0.8;
                }

                if ('color' in m) {
                    m.color = new THREE.Color(color);
                    m.needsUpdate = true;
                }
                if ('emissive' in m) {
                    m.emissive = new THREE.Color(color).multiplyScalar(0.06);
                    m.needsUpdate = true;
                }
            };

            if (Array.isArray(mesh.material)) mesh.material.forEach(applyColor);
            else applyColor(mesh.material);
            return true;
        } catch (e) {
            console.warn('setPartColor failed', e);
            return false;
        }
    }

    /**
     * Set multiple part colors via an object: { partName: color, ... }
     */
    setPartColors(map) {
        if (!map || typeof map !== 'object') return;
        Object.entries(map).forEach(([k, v]) => this.setPartColor(k, v));
    }

    /**
     * Set opacity for a single named part. `opacity` must be between 0 (invisible)
     * and 1 (fully opaque). Clones material(s) so changes do not affect other instances.
     */
    setPartOpacity(name, opacity = 1, options = {}) {
        if (!this._meshes[name]) {
            console.warn('setPartOpacity: part not found', name);
            return false;
        }
        const mesh = this._meshes[name];
        if (!mesh) return false;
        try {
            let mat = mesh.material;
            const applyOpacity = (m) => {
                if (!m) return m;
                const mm = m.clone();
                mm.transparent = true;
                mm.opacity = Math.max(0, Math.min(1, Number(opacity) || 0));
                if (options.depthWrite === false) mm.depthWrite = false;
                mm.needsUpdate = true;
                return mm;
            };

            if (Array.isArray(mat)) {
                mesh.material = mat.map(applyOpacity);
            } else {
                mesh.material = applyOpacity(mat);
            }
            return true;
        } catch (e) {
            console.warn('setPartOpacity failed', e);
            return false;
        }
    }

    /**
     * Set opacity for multiple parts via an object: { partName: opacity, ... }
     */
    setPartsOpacity(map, options = {}) {
        if (!map || typeof map !== 'object') return;
        Object.entries(map).forEach(([k, v]) => this.setPartOpacity(k, v, options));
    }

    /**
     * Restore original material for a part (removing transparency changes).
     * If `name` omitted, falls back to `resetPartColors` which restores all original materials.
     */
    resetPartOpacity(name) {
        if (!name) {
            this.resetPartColors();
            return;
        }
        const mesh = this._meshes[name];
        if (!mesh) return;
        try {
            if (mesh.userData && mesh.userData._origMaterial) {
                try {
                    if (mesh.material && mesh.material.dispose) mesh.material.dispose();
                } catch (e) {}
                mesh.material = mesh.userData._origMaterial;
            }
        } catch (e) {
            console.warn('resetPartOpacity failed', e);
        }
    }

    /**
     * Reset all meshes to their original materials (as loaded).
     */
    resetPartColors() {
        Object.values(this._meshes || {}).forEach((mesh) => {
            try {
                if (mesh.userData && mesh.userData._origMaterial) {
                    if (mesh.material && mesh.material.dispose) mesh.material.dispose();
                    mesh.material = mesh.userData._origMaterial;
                }
            } catch (e) {}
        });
    }

    /**
     * Apply sequence-specific highlighting to brain areas for *_2 sequences.
     * Highlighted areas use specific pastel colors, non-highlighted areas become medium grey.
     * @param {string} sequenceName - e.g., 'ant_emotion_2', 'human_intelligence_2'
     */
    applySequenceHighlighting(sequenceName) {
        if (!sequenceName || !this.highlightMapping[sequenceName]) {
            console.warn('applySequenceHighlighting: unknown sequence', sequenceName);
            return;
        }

        this._activeSequence = sequenceName;
        const config = this.highlightMapping[sequenceName];
        const { patterns } = config;
        const greyColor = '#D8D8D8'; // Light grey for non-highlighted areas
        const greyOpacity = 0.4; // 40% opacity for subtle background effect

        console.log(`Applying highlighting for sequence: ${sequenceName}`);

        // Get all available mesh names
        const allParts = this.getPartNames();
        if (!allParts || allParts.length === 0) {
            console.warn('No meshes available for highlighting');
            return;
        }

        // DEBUG: Log all available mesh names to help with mapping
        console.log('📋 Available mesh names:', allParts);
        console.log('🎯 Looking for patterns:', patterns);

        // Create a map to track which parts should be highlighted and with what color
        const highlightedParts = new Map();
        
        // Match mesh names with patterns (supports both keyword matching and part number matching)
        allParts.forEach(partName => {
            // Check each pattern
            patterns.forEach(({ keywords, partNumbers, colorKey, label }) => {
                let matched = false;
                let matchInfo = '';
                let color = null;
                
                // Try keyword matching first (for ant brain with descriptive names)
                if (keywords && keywords.length > 0) {
                    const partUpper = partName.toUpperCase();
                    const matchedKeyword = keywords.find(keyword => 
                        partUpper.includes(keyword.toUpperCase())
                    );
                    
                    if (matchedKeyword) {
                        matched = true;
                        // Get color from brainPartColors using the keyword
                        if (colorKey === 'ant' && this.brainPartColors.ant[matchedKeyword]) {
                            color = this.brainPartColors.ant[matchedKeyword];
                            matchInfo = `keyword "${matchedKeyword}"`;
                        }
                    }
                }
                
                // Try part number matching (for human brain with generic names like Brain_Part_01)
                if (!matched && partNumbers && partNumbers.length > 0) {
                    // Extract number from part name like "Brain_Part_01" -> 1
                    const numberMatch = partName.match(/Part[_\s]?(\d+)/i);
                    if (numberMatch) {
                        const partNum = parseInt(numberMatch[1], 10);
                        if (partNumbers.includes(partNum)) {
                            matched = true;
                            // Get color from brainPartColors using the part number
                            if (colorKey === 'human' && this.brainPartColors.human[partNum]) {
                                color = this.brainPartColors.human[partNum];
                                matchInfo = `part ${partNum} (${label || 'unknown region'})`;
                            }
                        }
                    }
                }
                
                if (matched && color) {
                    highlightedParts.set(partName, color);
                    console.log(`✓ Matched "${partName}" with ${matchInfo} → ${color}`);
                }
            });
        });

        // Ensure highlighted parts are fully opaque, then apply colors
        console.log('🔎 Highlighted mesh names:', Array.from(highlightedParts.keys()));
        highlightedParts.forEach((color, partName) => {
            // restore full opacity for highlighted parts
            try { this.setPartOpacity(partName, 1); } catch (e) {}
            this.setPartColorWithTransition(partName, color);
        });

        // Set all non-highlighted parts to light grey with transparency
        allParts.forEach(partName => {
            if (!highlightedParts.has(partName)) {
                this.setPartColorWithTransition(partName, greyColor);
                this.setPartOpacity(partName, greyOpacity);
            }
        });

        console.log(`✅ Highlighted ${highlightedParts.size} areas, greyed ${allParts.length - highlightedParts.size} areas`);
    }

    /**
     * Set color with smooth CSS transition effect (0.5s fade).
     * Internal helper for applySequenceHighlighting.
     */
    setPartColorWithTransition(name, color) {
        if (!this._meshes[name]) return;
        
        const mesh = this._meshes[name];
        try {
            // Clone material to avoid affecting other instances
            let mat = mesh.material;
            if (Array.isArray(mat)) {
                mat = mat.map(m => m.clone());
                mesh.material = mat;
            } else {
                mesh.material = mat.clone();
            }

            const applyColor = (m) => {
                if (!m) return;
                
                // Remove textures to ensure color shows
                try { m.map = null; } catch (e) {}
                try { m.alphaMap = null; } catch (e) {}
                try { m.envMap = null; } catch (e) {}
                
                // Make material more diffuse for flat color visibility
                if ('metalness' in m) m.metalness = 0.1;
                if ('roughness' in m) m.roughness = 0.8;

                // Apply the color
                if ('color' in m) {
                    m.color = new THREE.Color(color);
                    m.needsUpdate = true;
                }
                
                // Add subtle emissive to make colors pop
                if ('emissive' in m) {
                    m.emissive = new THREE.Color(color).multiplyScalar(0.1);
                    m.needsUpdate = true;
                }
            };

            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(applyColor);
            } else {
                applyColor(mesh.material);
            }
        } catch (e) {
            console.warn('setPartColorWithTransition failed for', name, e);
        }
    }

    /**
     * Clear sequence highlighting and restore default appearance.
     */
    clearSequenceHighlighting() {
        this._activeSequence = null;
        this.resetPartColors();
        console.log('Sequence highlighting cleared');
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this._pivot) {
            this.scene.remove(this._pivot);
            this._pivot = null;
        }
        
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
        
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }
        
        this.scene = null;
        this.camera = null;
        
        console.log('3D Viewer disposed');
    }
}

