
document.addEventListener('DOMContentLoaded', (event) => {
    window.scrollTo(0, document.body.scrollHeight);
    console.log('DOM fully loaded and parsed', document.body.scrollHeight);
});


let canvas, renderer;

const scene = new THREE.Scene();
const loader = new THREE.GLTFLoader();
const objects = {
    sun: {
        type: 'planet',
        model: new THREE.Object3D(),
        modelPath: 'models/Sun_1_1391000.glb',
        scale: new THREE.Vector3(0.1, 0.1, 0.1),
    },
    mercury: {
        type: 'planet',
        model: new THREE.Object3D(),
        modelPath: 'models/Mercury_1_4878.glb',
        scale: new THREE.Vector3(0.009, 0.009, 0.009),
    },
    venus: {
        type: 'planet',
        model: new THREE.Object3D(),
        modelPath: 'models/Venus(surface)_1_12103_modified.glb',
        scale: new THREE.Vector3(0.013, 0.013, 0.013),
    },
    moon: {
        //https://www.turbosquid.com/3d-models/realistic-moon-photorealistic-2k-model-1277420
        type: 'planet',
        model: new THREE.Object3D(),
        modelPath: 'models/moon.glb',
        scale: new THREE.Vector3(1.8, 1.8, 1.8),
    },
    satellite: {
        //https://sketchfab.com/3d-models/low-poly-satellite-964642731c274468bf9f7c03dbfdb8b9
        type: 'object',
        model: new THREE.Object3D(),
        modelPath: 'models/satellite01.glb',
        scale: new THREE.Vector3(0.5, 0.5, 0.5),
    },
    meteor: {
        //https://www.turbosquid.com/3d-models/asteroid-space-planet-3ds-free/616773#
        type: 'object',
        model: new THREE.Object3D(),
        modelPath: 'models/meteor.glb',
        scale: new THREE.Vector3(0.1, 0.1, 0.1),
    },

    jet: {
        //https://sketchfab.com/3d-models/f117-fighter-jet-04ef3c59a49647f9a036c334f3f52e72
        type: 'object',
        model: new THREE.Object3D(),
        modelPath: 'models/jet.glb',
        scale: new THREE.Vector3(0.2, 0.2, 0.2),
    },
    plane: {
        //https://sketchfab.com/3d-models/boeing-787-dreamliner-3ba8a5275d0e41968b34d367c34e8f0f
        type: 'object',
        model: new THREE.Object3D(),
        modelPath: 'models/plane.glb',
        scale: new THREE.Vector3(0.2, 0.2, 0.2),
    },
    balloon: {
        type: 'object',
        model: new THREE.Object3D(),
        modelPath: 'models/balloon.glb',
        scale: new THREE.Vector3(0.04, 0.04, 0.04),
    },
};
const rocket = {
    name: 'rocket',
    group: new THREE.Group(),
    modelPath: 'models/SPACE SHUTTLE_modified.glb',
    leftThruster: new THREE.Group(),
    rightThruster: new THREE.Group(),
    shuttle: new THREE.Group(),
    fuelTank: new THREE.Group(),
    scale: new THREE.Vector3(0.7, 0.7, 0.7),
};

const testmodel = new THREE.Object3D();
init();
animate();

function init() {

    canvas = document.querySelector('#c')

    const content = document.querySelector('.container');

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 2000;
    const camera = new THREE.PerspectiveCamera(fov, 1, near, far);

    camera.position.set(0, 0, 50);
    // camera.position.set(0, 0, window.innerWidth / 30);
    camera.lookAt(0, 0, 0);
    // scene.add(camera);
    scene.userData.camera = camera;


    const frustum = new THREE.Frustum()
    const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(matrix)


    for (const desc in objects) {
        console.log(objects[desc].modelPath);
        loader.load(objects[desc].modelPath, function (gltf) {
            objects[desc].model.scale.copy(objects[desc].scale);
            objects[desc].model.add(gltf.scene);
            objects[desc].model.traverseVisible((child) => {
                if (child.isMesh) {
                    // while (frustum.intersectsObject(child)) {
                    //     objects[desc].model.position.y += 1;
                    // }
                    // child.geometry.position.y += 10000;
                    // child.geometry.computeBoundingSphere()
                    // console.log(child)
                    // console.log(frustum.intersectsObject(child))
                    // console.log(frustum.intersectsSphere(child.geometry.boundingSphere))
                    // console.log(frustum.containsPoint(child.position))
                    // console.log(frustum.containsPoint(objects[desc].model.position))
                }
            })
            // while (frustum.intersectsObject(objects[desc].model)) {
            //     objects[desc].model.position.y += 1;
            // };

            scene.add(objects[desc].model);
            // console.log(frustum.intersectsObject(objects[desc].model));
        });
    }



    loader.load(rocket.modelPath, function (gltf) {
        rocket.group.scale.copy(rocket.scale);

        rocket.leftThruster.add(gltf.scene.getObjectByName('SIDE_THRUSTER(LEFT)'));
        rocket.shuttle.add(gltf.scene.getObjectByName('SPACE_SHUTTLE'));
        rocket.fuelTank.add(gltf.scene.getObjectByName('ROCKET_BODY'));
        rocket.rightThruster.add(gltf.scene.getObjectByName('SIDE_THRUSTER_(RIGHT)'));

        rocket.group.add(rocket.leftThruster);
        rocket.group.add(rocket.shuttle);
        rocket.group.add(rocket.fuelTank);
        rocket.group.add(rocket.rightThruster);

        console.log(rocket.group)
        // rocket.group.rotation.x = 10

        scene.add(rocket.group);
        rocket.group.traverse(function (test) {
            // test.position.y += 10
            // console.log(test)
            if (test.isMesh) {
                // test.position.y = 10
                // console.log(frustum.intersectsObject(test))
            }
            // isVisible = true
        })


        gsapAnimation()
    });



    // the element that represents the area we want to render the scene
    scene.userData.element = canvas;




    // const controls = new THREE.OrbitControls(scene.userData.camera, scene.userData.element);
    // controls.minDistance = 2;
    // controls.maxDistance = 5;
    // controls.enablePan = false;
    // controls.enableZoom = false;
    // scene.userData.controls = controls;

    light = new THREE.PointLight(0xffffff, 1.5);
    this.light.position.z = 50;
    this.light.position.x = 70;
    this.light.position.y = -20;
    scene.add(light);
    softLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(softLight);

    // scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));

    // const light = new THREE.DirectionalLight(0xffffff, 0.5);
    // light.position.set(1, 1, 1);
    // scene.add(light);




    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    // document.body.appendChild(renderer.domElement);

    const defaultColourSplinePoints = [
        {
            life: 0.0,
            value: 0xFFFF80,
        },
        {
            life: 1.0,
            value: 0xFF8080,
        },
    ];

    const defaultSizeSplinePoints = [
        {
            life: 0.0,
            value: 1.0,
        },
        {
            life: 0.5,
            value: 5.0,
        },
        {
            life: 1.0,
            value: 10.0,
        },
    ];

    leftFlames = new ParticleSystem({
        parent: scene,
        camera: camera,
        particleAmount: 30,
        life: 5,
        size: 3,
        velocity: { x: 0, y: -10, z: 0 },
        drag: 0.3,
        colourSplinePoints: defaultColourSplinePoints,
        sizeSplinePoints: defaultSizeSplinePoints,
    });

    rocket.leftThruster.add(leftFlames._points)

    leftFlames._points.position.y = -10
    leftFlames._points.position.z = 1.5


    rightFlames = new ParticleSystem({
        parent: scene,
        camera: camera,
        particleAmount: 30,
        life: 5,
        size: 3,
        velocity: { x: 0, y: -10, z: 0 },
        drag: 0.3,
        colourSplinePoints: defaultColourSplinePoints,
        sizeSplinePoints: defaultSizeSplinePoints,
    });

    rocket.rightThruster.add(rightFlames._points)

    rightFlames._points.position.y = -10
    rightFlames._points.position.z = -3.5


    middleFlames = new ParticleSystem({
        parent: scene,
        camera: camera,
        particleAmount: 30,
        life: 3,
        size: 2,
        velocity: { x: 0, y: -8, z: 0 },
        drag: 0.3,
        colourSplinePoints: defaultColourSplinePoints,
        sizeSplinePoints: defaultSizeSplinePoints,
    });

    rocket.shuttle.add(middleFlames._points)

    middleFlames._points.position.y = -9.5
    middleFlames._points.position.z = -1
    middleFlames._points.position.x = 3

    balloonFlames = new ParticleSystem({
        parent: scene,
        camera: camera,
        particleAmount: 30,
        life: 3,
        size: 0.3,
        velocity: { x: 0, y: 8, z: 0 },
        drag: 0.3,
        colourSplinePoints: defaultColourSplinePoints,
        sizeSplinePoints: defaultSizeSplinePoints,
    });

    objects.balloon.model.add(balloonFlames._points)

    balloonFlames._points.position.y = 50
    // balloonFlames._points.position.z = -1
    // balloonFlames._points.position.x = 3

    meteorFlames = new ParticleSystem({
        parent: scene,
        camera: camera,
        particleAmount: 30,
        life: 5,
        size: 3,
        velocity: { x: -50, y: 0, z: 0 },
        drag: 0.0,
        colourSplinePoints: [
            {
                life: 0.0,
                value: 0xFFFF80,
            },
            {
                life: 0.6,
                value: 0xd82020,
            },
            {
                life: 0.8,
                value: 0x292424,
            },
        ],
        sizeSplinePoints: [
            {
                life: 0.0,
                value: 3.0,
            },
            {
                life: 0.5,
                value: 5.0,
            },
            {
                life: 1.0,
                value: 10.0,
            },
        ],
    });

    objects.meteor.model.add(meteorFlames._points)

    // meteorFlames._points.position.y = 4
    // meteorFlames._points.position.z = -1
    // meteorFlames._points.position.x = 3

    // testmodel.add(objects.meteor.model.clone());
    // console.log(testmodel);
    // scene.add(testmodel)

    updateSize();
    window.addEventListener('resize', updateSize, false);

}

function updateSize() {


    // const width = canvas.clientWidth;
    const width = window.innerWidth;
    // const height = canvas.clientHeight;
    const height = window.innerHeight;

    console.log(width, height)
    // const height = document.body.scrollHeight;

    // if (canvas.width !== width || canvas.height !== height) {

    renderer.setSize(width, height);

    // }

}

function animate() {

    render();
    requestAnimationFrame(animate);

}

function render() {

    // updateSize();

    // so something moves
    for (const desc in objects) {
        if (objects[desc].type === 'planet') {
            objects[desc].model.rotation.y = Date.now() * 0.0002;
        }
    }

    // scene.children[0].rotation.y = Date.now() * 0.001;
    // rocket.group.rotation.y = Date.now() * 0.0002;



    const camera = scene.userData.camera;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    //scene.userData.controls.update();

    renderer.render(scene, camera);


}

function gsapAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    console.log(document.querySelectorAll('.component'))

    const components = document.querySelectorAll('.component');

    let sectionDuration = 0.2;
    const tau = Math.PI * 2;
    gsap.set(rocket.group.position, {
        y: -10
    });
    gsap.set(rocket.group.rotation, {
        y: tau * -.25
    });
    gsap.set(middleFlames._points, {
        visible: false
    });



    //Create timeline for each html component
    timelines = {};
    for (const component of components) {
        timelines[component.id] = new gsap.timeline({
            paused: true,
            defaults: {
                duration: sectionDuration,
                ease: 'power2.inOut'
            }
        });

    }

    //Timeline for rocket animation
    let tl = new gsap.timeline({
        paused: true,
        defaults: {
            duration: sectionDuration,
            ease: 'power2.inOut'
        }
    });

    let delay = 0;

    // tl.to(camera.rotation, {
    //     y: 10,
    //     ease: 'power1.in'
    // }, delay);

    // delay += sectionDuration;
    tl.to(rocket.group.position, {
        y: 5,
        ease: 'power1.in',
        duration: 0.05
    }, delay);

    tl.to(rocket.group.rotation, {
        y: tau * -.45,
        ease: 'power1.in',
        duration: 0.05
    }, delay);

    delay += 0.1;


    tl.to(rocket.leftThruster.position, {
        x: -5,
        y: -43,
        z: 2,
        ease: 'power1.in',
        duration: 0.05

    }, delay);

    tl.to(rocket.rightThruster.position, {
        x: -5,
        y: -43,
        z: -2,
        ease: 'power1.in',
        duration: 0.05

    }, delay);

    tl.to(rocket.leftThruster.rotation, {
        // x: tau * 0.05,
        z: tau * 0.15,
        ease: 'power1.in',
        duration: 0.05

    }, delay);
    tl.to(rocket.rightThruster.rotation, {
        // x: - tau * 0.05,
        z: tau * 0.15,
        ease: 'power1.in',
        duration: 0.05

    }, delay);

    tl.set(rocket.leftThruster, {
        visible: false
    })
    tl.set(rocket.rightThruster, {
        visible: false
    })

    tl.set(middleFlames._points, {
        visible: true
    }, delay + 0.05);


    delay += 0.1;

    tl.to(rocket.fuelTank.position, {
        x: -3,
        y: -45,
        z: 0,
        ease: 'power1.in',
        duration: 0.05

    }, delay);

    tl.to(rocket.fuelTank.rotation, {
        // x: tau * 0.05,
        z: tau * 0.1,
        ease: 'power1.in',
        duration: 0.05

    }, delay);

    tl.set(rocket.fuelTank, {
        visible: false
    })

    delay += 0.05;

    tl.to(rocket.group.rotation, {
        x: 0,
        y: tau * -0.25,
        ease: 'power1.in',
        duration: 0.02
    }, delay);

    tl.to(rocket.group.scale, {
        x: 0.4,
        y: 0.4,
        z: 0.4,
        ease: 'power1.in',
        duration: 0.05
    }, delay);


    tl.to(middleFlames, {
        _size: 1,
        ease: 'power1.in',
        duration: 0.02
    }, delay);

    delay += 0.05;
    tl.to(rocket.group.position, {
        x: 0,
        y: -5,
        z: 0,
        ease: 'power1.in',
        duration: 0.05
    }, delay);

    delay += 0.05;

    // Venus orbit animation
    tl.to(rocket.group.position, {
        x: 23,
        // z: -100,
        y: 0,
        ease: 'power1.inOut',
        duration: 0.04
    }, delay);

    tl.to(rocket.group.position, {
        z: -60,
        ease: 'power1.in',
        duration: 0.02
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        x: tau * -0.25,
        // y: tau * -0.25,
        ease: 'power1.inOut',
        duration: 0.04
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        z: tau * 0.1,
        ease: 'power1.inOut',
        duration: 0.02
    }, delay);

    delay += 0.02;

    tl.to(rocket.group.position, {
        z: 0,
        ease: 'power1.out',
        duration: 0.02
    }, delay);

    tl.to(rocket.shuttle.rotation, {

        z: -tau * 0.3,
        ease: 'power1.inOut',
        duration: 0.02
    }, delay);

    delay += 0.02;

    tl.to(rocket.group.position, {
        x: 0,
        // z: -100,
        y: 5,
        ease: 'power1.inOut',
        duration: 0.04
    }, delay);

    tl.to(rocket.group.position, {
        z: 20,
        ease: 'power1.in',
        duration: 0.02
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        x: -tau * 0.5,

        z: -tau * 0.5,
        ease: 'power1.inOut',
        duration: 0.04
    }, delay);

    delay += 0.02;

    tl.to(rocket.group.position, {
        z: 0,
        ease: 'power1.in',
        duration: 0.02
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        y: tau * 0.5,
        ease: 'power1.inOut',
        duration: 0.02
    }, delay);

    delay += 0.06;

    // Final sun animation

    tl.to(rocket.group.position, {
        y: 0,
        x: -15,
        ease: 'power1.out',
        duration: 0.04
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        x: - tau * 0.25,
        y: tau * 0.5,
        z: -tau * 0.8,
        ease: 'power1.out',
        duration: 0.04
    }, delay);

    tl.to(rocket.group.position, {
        z: 30,
        ease: 'power1.in',
        duration: 0.06
    }, delay);

    delay += 0.04;

    tl.to(rocket.group.position, {
        x: 0,
        ease: 'power1.in',
        duration: 0.03
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        x: - tau * 0.25,
        y: tau * 0.5,
        z: -tau * 1,
        ease: 'power1.in',
        duration: 0.03
    }, delay);

    delay += 0.03;

    tl.to(rocket.group.position, {
        z: -200,
        ease: 'power1.in',
        duration: 0.05
    }, delay);

    tl.to(rocket.shuttle.rotation, {
        // y: tau * 0.6,
        z: -tau * 1.25,
        ease: 'power1.inOut',
        duration: 0.02
    }, delay);

    // delay += 0.02;

    // tl.to(rocket.shuttle.rotation, {
    //     x: - tau * 0.5,
    //     ease: 'power1.inOut',
    //     duration: 0.03
    // }, delay);


    // delay += 0.1;

    //Scroll trigger for rocket animation
    ScrollTrigger.create({
        trigger: ".container",
        // scrub: true,
        start: "top top",
        end: "bottom bottom",
        markers: true,
        // animation: tl
        onUpdate(self) {
            gsap.to(tl, {
                progress: 1 - self.progress,
                ease: "none",
                overwrite: true,
                duration: 0,
            });
        }
    });


    //---- Balloon animation -----
    gsap.set(objects.balloon.model.position, {
        x: 15,
        y: 22,
        z: 0,
    });

    timelines.troposphere.to(objects.balloon.model.position, {
        x: 10,
        y: -45,
        ease: 'power1.in',
        duration: 0.3
    }, 0);

    //---- Plane animation -----
    gsap.set(objects.plane.model.position, {
        x: 0,
        y: 30,
        z: 0,
    });
    gsap.set(objects.plane.model.rotation, {
        // x: 0.25 * tau,
        y: -0.25 * tau,
        // z: -0.25 * tau,
    });
    timelines.troposphere.to(objects.plane.model.position, {
        x: -35,
        y: -30,
        ease: 'power1.in',
        duration: 0.3
    }, 0);

    //---- Jet animation -----
    gsap.set(objects.jet.model.position, {
        x: -25,
        y: 23,
        z: 0,
    });
    gsap.set(objects.jet.model.rotation, {
        x: 0.25 * tau,
        y: 0.05 * tau,
        z: -0.25 * tau,
    });

    timelines.stratosphere.to(objects.jet.model.rotation, {
        // x: -5,
        y: 0.35 * tau,
        // z: 0.65 * tau,
        ease: 'power1.inOut',
        duration: 0.1
    }, 0);

    timelines.stratosphere.to(objects.jet.model.position, {
        x: -13,
        y: 0,
        ease: 'power1.inOut',
        duration: 0.1
    }, 0);

    timelines.stratosphere.to(objects.jet.model.rotation, {
        // x: -5,
        y: 0.5 * tau,
        z: 0.65 * tau,
        ease: 'power1.inOut',
        duration: 0.1
    }, 0.1);

    timelines.stratosphere.to(objects.jet.model.position, {
        x: -10,
        y: 10,
        ease: 'power1.inOut',
        duration: 0.1
    }, 0.1);

    timelines.stratosphere.to(objects.jet.model.rotation, {
        // x: -5,
        y: 0.85 * tau,
        z: 0.2 * tau,
        ease: 'power1.inOut',
        duration: 0.1
    }, 0.2);

    timelines.stratosphere.to(objects.jet.model.position, {
        x: -16,
        y: -24,
        ease: 'power1.inOut',
        duration: 0.1
    }, 0.2);

    //---- Meteor animation -----
    gsap.set(objects.meteor.model.position, {
        x: 15,
        y: 22,
        z: 20,
    });
    gsap.set(objects.meteor.model.rotation, {
        x: 0.25 * tau,
        y: 0.7 * tau,
        // z: -0.25 * tau,
    });

    timelines.mesophere.to(objects.meteor.model.position, {
        x: 0,
        y: -85,
        z: -100,
        ease: 'power1.in',
        duration: 0.2
    }, 0);

    timelines.mesophere.to(objects.meteor.model.rotation, {
        x: 0.2 * tau,
        y: 0.65 * tau,
        // z: -0.25 * tau,
        ease: 'power1.in',
        duration: 0.2
    }, 0);

    timelines.mesophere.set(objects.meteor.model, {
        visible: false
    });

    //---- Sattelite animation -----
    gsap.set(objects.satellite.model.position, {
        x: -25,
        y: 28,
        z: 0,
    });
    gsap.set(objects.satellite.model.rotation, {
        x: 0.5 * tau,
        y: 0.25 * tau,
        z: -0.05 * tau,
    });

    timelines.exosphere.to(objects.satellite.model.position, {
        x: -10,
        y: -35,
        z: -30,
        ease: 'power1.in',
        duration: 0.2
    }, 0);

    timelines.exosphere.to(objects.satellite.model.rotation, {
        // x: -0.5 * tau,
        y: 1.3 * tau,
        z: -0 * tau,
        ease: 'power1.in',
        duration: 0.2
    }, 0);


    //---- Moon animation -----
    gsap.set(objects.moon.model.position, {
        x: -12,
        y: 28,
        z: 0,
    });

    timelines.moon.to(objects.moon.model.position, {

        y: -35,
        ease: 'power1.in',
        duration: 0.2
    }, 0);

    //---- Venus animation -----
    gsap.set(objects.venus.model.position, {
        x: 10,
        y: 35,
        z: 0,
    });

    timelines.venus.to(objects.venus.model.position, {

        y: 0,
        ease: 'power1.out',
        duration: 0.2
    }, 0);

    timelines.venus.to(objects.venus.model.position, {

        y: -35,
        ease: 'power1.in',
        duration: 0.2
    }, 0.4);

    //---- Mercury animation -----
    gsap.set(objects.mercury.model.position, {
        x: -12,
        y: 30,
        z: 0,
    });

    timelines.mercury.to(objects.mercury.model.position, {

        y: -30,
        ease: 'power1.inOut',
        duration: 0.2
    }, 0);

    //---- Sun animation -----
    gsap.set(objects.sun.model.position, {
        x: 0,
        y: 160,
        z: -200,
    });

    timelines.sun.to(objects.sun.model.position, {

        // y: -35,
        y: 0,
        ease: 'power4.out',
        duration: 0.2
    }, 0);

    for (const timeline in timelines) {
        console.log(timelines[timeline])

        ScrollTrigger.create({
            trigger: "#" + timeline,
            start: "top center",
            end: "bottom top",
            markers: true,
            onUpdate(self) {
                gsap.to(timelines[timeline], {
                    progress: 1 - self.progress,
                    ease: "expo",
                    overwrite: true,
                    duration: 0,
                });
            }
        });
    }

    // for (const desc in objects) {
    //     if (objects[desc].type === "planet") {
    //         let tl2 = new gsap.timeline({
    //             paused: true,
    //             defaults: {
    //                 duration: sectionDuration,
    //                 ease: 'power2.inOut'
    //             }
    //         });


    //         tl2.to(objects[desc].model.position, {
    //             y: 0,
    //             ease: 'power1.in',
    //         }, 0);

    //         tl2.to(objects[desc].model.position, {
    //             y: -28,
    //             ease: 'power1.in',
    //         }, 0.3);


    //         ScrollTrigger.create({
    //             trigger: "." + desc,
    //             // scrub: true,
    //             start: "top center",
    //             end: "bottom top",
    //             markers: true,
    //             // animation: tl
    //             onUpdate(self) {
    //                 gsap.to(tl2, {
    //                     progress: 1 - self.progress,
    //                     ease: "expo",
    //                     overwrite: true,
    //                     duration: 0,
    //                 });
    //             }
    //         });
    //     }
    // }



    // let tl3 = new gsap.timeline({
    //     // onUpdate: render,
    //     scrollTrigger: {
    //         trigger: ".sun",
    //         scrub: true,
    //         start: "center center",
    //         end: "+=3500 bottom",
    //         pin: true,
    //         markers: true,
    //     },
    //     defaults: {
    //         duration: sectionDuration,
    //         ease: 'power2.inOut'
    //     }
    // });
    // let delay3 = 0;

    // tl3.to(objects[0].model.position, {
    //     y: 0,
    //     ease: 'power1.in',
    // }, delay3);
    // delay3 += sectionDuration;

    // tl3.to(objects[0].model.position, {
    //     y: 28,
    //     ease: 'power1.in',
    // }, delay3);
    // delay3 += sectionDuration;


    // ScrollTrigger.create({
    //     trigger: '.venus',
    //     animation: tl2,
    //     pin: true,
    //     start: 'center center',
    //     end: '+=1500 bottom',
    //     scrub: 1, // I like the 1 sec delay, set to true for exact anime on scroll
    //     markers: true,
    // })

}



