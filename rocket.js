

const _VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

const _FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;


class LinearSpline {
    constructor(lerp) {
        this._points = [];
        this._lerp = lerp;
    }

    AddPoint(t, d) {
        this._points.push([t, d]);
    }

    Get(t) {
        let p1 = 0;

        for (let i = 0; i < this._points.length; i++) {
            if (this._points[i][0] >= t) {
                break;
            }
            p1 = i;
        }

        const p2 = Math.min(this._points.length - 1, p1 + 1);

        if (p1 == p2) {
            return this._points[p1][1];
        }

        return this._lerp(
            (t - this._points[p1][0]) / (
                this._points[p2][0] - this._points[p1][0]),
            this._points[p1][1], this._points[p2][1]);
    }
}


class ParticleSystem {
    constructor(params) {
        const uniforms = {
            diffuseTexture: {
                value: new THREE.TextureLoader().load('./resources/fire.png')
            },
            pointMultiplier: {
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            }
        };

        this._material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        this._camera = params.camera;
        this._particles = [];

        this._geometry = new THREE.BufferGeometry();
        this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        this._geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
        this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
        this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

        this._points = new THREE.Points(this._geometry, this._material);

        params.parent.add(this._points);

        this._alphaSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        this._alphaSpline.AddPoint(0.0, 0.0);
        this._alphaSpline.AddPoint(0.1, 1.0);
        this._alphaSpline.AddPoint(0.6, 1.0);
        this._alphaSpline.AddPoint(1.0, 0.0);

        this._colourSpline = new LinearSpline((t, a, b) => {
            const c = a.clone();
            return c.lerp(b, t);
        });
        this._colourSpline.AddPoint(0.0, new THREE.Color(0xFFFF80));
        this._colourSpline.AddPoint(1.0, new THREE.Color(0xFF8080));

        this._sizeSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        this._sizeSpline.AddPoint(0.0, 1.0);
        this._sizeSpline.AddPoint(0.5, 5.0);
        this._sizeSpline.AddPoint(1.0, 1.0);

        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);

        this._UpdateGeometry();
    }

    _onKeyUp(event) {
        switch (event.keyCode) {
            case 32: // SPACE
                this._AddParticles();
                break;
        }
    }

    _AddParticles(timeElapsed) {
        if (!this.gdfsghk) {
            this.gdfsghk = 0.0;
        }
        this.gdfsghk += timeElapsed;
        const n = Math.floor(this.gdfsghk * 20.0);
        this.gdfsghk -= n / 20.0;

        for (let i = 0; i < n; i++) {
            const life = (Math.random() * 0.75 + 0.25) * 10.0;
            this._particles.push({
                position: new THREE.Vector3(
                    (Math.random() * 2 - 10) * 1.0,
                    (Math.random() * 2 - 10) * 1.0,
                    (Math.random() * 2 - 10) * 1.0),
                size: (Math.random() * 0.5 + 0.5) * 10.0,
                colour: new THREE.Color(),
                alpha: 1.0,
                life: life,
                maxLife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                velocity: new THREE.Vector3(0, -15, 0),
            });
        }
    }

    _UpdateGeometry() {
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];

        for (let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            sizes.push(p.currentSize);
            angles.push(p.rotation);
        }

        this._geometry.setAttribute(
            'position', new THREE.Float32BufferAttribute(positions, 3));
        this._geometry.setAttribute(
            'size', new THREE.Float32BufferAttribute(sizes, 1));
        this._geometry.setAttribute(
            'colour', new THREE.Float32BufferAttribute(colours, 4));
        this._geometry.setAttribute(
            'angle', new THREE.Float32BufferAttribute(angles, 1));

        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.size.needsUpdate = true;
        this._geometry.attributes.colour.needsUpdate = true;
        this._geometry.attributes.angle.needsUpdate = true;
    }

    _UpdateParticles(timeElapsed) {
        for (let p of this._particles) {
            p.life -= timeElapsed;
        }

        this._particles = this._particles.filter(p => {
            return p.life > 0.0;
        });

        for (let p of this._particles) {
            const t = 1.0 - p.life / p.maxLife;

            p.rotation += timeElapsed * 0.5;
            p.alpha = this._alphaSpline.Get(t);
            p.currentSize = p.size * this._sizeSpline.Get(t);
            p.colour.copy(this._colourSpline.Get(t));

            p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

            const drag = p.velocity.clone();
            drag.multiplyScalar(timeElapsed * 0.5);
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
            p.velocity.sub(drag);
        }

        this._particles.sort((a, b) => {
            const d1 = this._camera.position.distanceTo(a.position);
            const d2 = this._camera.position.distanceTo(b.position);

            if (d1 > d2) {
                return -1;
            }

            if (d1 < d2) {
                return 1;
            }

            return 0;
        });
    }

    Step(timeElapsed) {
        this._AddParticles(timeElapsed);
        this._UpdateParticles(timeElapsed);
        this._UpdateGeometry();
    }
}

class ParticleSystemDemo {
    constructor() {
        this._Initialize();
    }

    _Initialize() {
        this._threejs = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this._threejs.domElement);

        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(25, 10, 0);

        this._scene = new THREE.Scene();

        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);

        light = new THREE.AmbientLight(0x101010);
        this._scene.add(light);

        const controls = new THREE.OrbitControls(
            this._camera, this._threejs.domElement);
        controls.target.set(0, 0, 0);
        controls.update();

        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/posx.jpg',
            './resources/negx.jpg',
            './resources/posy.jpg',
            './resources/negy.jpg',
            './resources/posz.jpg',
            './resources/negz.jpg',
        ]);
        // this._scene.background = texture;

        this._particles = new ParticleSystem({
            parent: this._scene,
            camera: this._camera,
        });

        // this._LoadModel();

        this._previousRAF = null;
        this._RAF();
    }

    // _LoadModel() {
    //     const loader = new THREE.GLTFLoader();
    //     loader.load('./resources/rocket/Rocket_Ship_01.gltf', (gltf) => {
    //         gltf.scene.traverse(c => {
    //             c.castShadow = true;
    //         });
    //         this._scene.add(gltf.scene);
    //     });
    // }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _RAF() {
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }

            this._RAF();

            this._threejs.render(this._scene, this._camera);
            this._Step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }

    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;

        this._particles.Step(timeElapsedS);
    }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new ParticleSystemDemo();
});


// console.log('test')
// window.scrollTo(0, 11218);

// document.addEventListener('DOMContentLoaded', (event) => {
//     window.scrollTo(0, document.body.scrollHeight);
//     console.log('DOM fully loaded and parsed', document.body.scrollHeight);
// }); 


'use strict';

/* global THREE */

function main() {
    const canvas = document.createElement('canvas');
    const loader = new THREE.GLTFLoader();
    const STLLoader = new THREE.STLLoader();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setScissorTest(true);
    const sunModel = new THREE.Object3D();
    const mercuryModel = new THREE.Object3D();
    const venusModel = new THREE.Object3D();
    const moonModel = new THREE.Object3D();
    const rocketModel = new THREE.Object3D();

    const sceneElements = [];
    function addScene(elem, fn) {
        const ctx = document.createElement('canvas').getContext('2d');
        elem.appendChild(ctx.canvas);
        sceneElements.push({ elem, ctx, fn });
    }

    function makeScene(elem) {
        const scene = new THREE.Scene();

        const fov = 45;
        const aspect = 2;  // the canvas default
        const near = 0.1;
        const far = 5;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 1, 2);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        const gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);

        const controls = new THREE.TrackballControls(camera, elem);
        controls.noZoom = true;
        controls.noPan = true;

        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            scene.add(light);
        }

        return { scene, camera, controls };
    }

    const sceneInitFunctionsByName = {
        'sun': (elem) => {
            const { scene, camera, controls } = makeScene(elem);
            loader.load('models/Sun_1_1391000.glb', function (gltf) {

                sunModel.scale.set(0.001, 0.001, 0.001)

                sunModel.add(gltf.scene)
                scene.add(sunModel);

                // render();

            });
            return (time, rect) => {
                sunModel.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },
        'mercury': (elem) => {
            const { scene, camera, controls } = makeScene(elem);
            loader.load('models/Mercury_1_4878.glb', function (gltf) {

                mercuryModel.scale.set(0.001, 0.001, 0.001)

                mercuryModel.add(gltf.scene)
                scene.add(mercuryModel);

                // render();

            });
            return (time, rect) => {
                mercuryModel.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },
        'venus': (elem) => {
            const { scene, camera, controls } = makeScene(elem);
            loader.load('models/Venus(surface)_1_12103.glb', function (gltf) {

                venusModel.scale.set(0.001, 0.001, 0.001)

                venusModel.add(gltf.scene)
                scene.add(venusModel);

                // render();

            });
            return (time, rect) => {
                venusModel.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },
        'moon': (elem) => {
            const { scene, camera, controls } = makeScene(elem);
            loader.load('models/Moon_1_3474.glb', function (gltf) {

                moonModel.scale.set(0.001, 0.001, 0.001)

                moonModel.add(gltf.scene)
                scene.add(moonModel);

                // render();

            });
            return (time, rect) => {
                moonModel.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },
        'rocket': (elem) => {
            const { scene, camera, controls } = makeScene(elem);
            STLLoader.load('models/saturnv_v2/S-II.stl', function (geometry) {

                const material = new THREE.MeshPhongMaterial({ color: 0x666463, specular: 0x111111, shininess: 100 });
                const mesh = new THREE.Mesh(geometry, material);

                mesh.position.set(0, 1, -0.6);
                mesh.rotation.set(0, Math.PI / 2, 2.8);
                mesh.scale.set(0.003, 0.003, 0.003);

                // mesh.castShadow = true;
                // mesh.receiveShadow = true;

                scene.add(mesh);

                // moonModel.scale.set(0.001, 0.001, 0.001)

                // moonModel.add(gltf.scene)
                // scene.add(moonModel);

                // render();

            });
            return (time, rect) => {
                // mesh.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },
    };

    document.querySelectorAll('[data-diagram]').forEach((elem) => {
        const sceneName = elem.dataset.diagram;
        const sceneInitFunction = sceneInitFunctionsByName[sceneName];
        const sceneRenderFunction = sceneInitFunction(elem);
        addScene(elem, sceneRenderFunction);
    });

    function render(time) {
        time *= 0.001;

        for (const { elem, fn, ctx } of sceneElements) {
            // get the viewport relative position opf this element
            const rect = elem.getBoundingClientRect();
            const { left, right, top, bottom, width, height } = rect;
            // console.log(height);
            const rendererCanvas = renderer.domElement;

            const isOffscreen =
                bottom < 0 ||
                top > window.innerHeight ||
                right < 0 ||
                left > window.innerWidth;

            if (!isOffscreen) {
                // make sure the renderer's canvas is big enough
                if (rendererCanvas.width < width || rendererCanvas.height < height) {
                    renderer.setSize(width, height, false);
                }

                // make sure the canvas for this area is the same size as the area
                if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
                    ctx.canvas.width = width;
                    ctx.canvas.height = height;
                }

                renderer.setScissor(0, 0, width, height);
                renderer.setViewport(0, 0, width, height);

                fn(time, rect);

                // copy the rendered scene to this element's canvas
                ctx.globalCompositeOperation = 'copy';
                ctx.drawImage(
                    rendererCanvas,
                    0, rendererCanvas.height - height, width, height,  // src rect
                    0, 0, width, height);                              // dst rect
            }
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);




}

main();



