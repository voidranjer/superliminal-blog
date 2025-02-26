import * as THREE from "three";
import { onKeyDown, onKeyUp } from "./eventListeners";
import { updateCameraPosition } from "./camera";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// three.js objects (https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const pointerLockControls = new PointerLockControls(camera, document.body);

// state variables
const state = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

// setup function: we call this function only once at the beginning of the program to setup the scene
function setup() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  document.body.addEventListener("click", (e) => pointerLockControls.lock());
  document.body.addEventListener("keydown", (e) => onKeyDown(e, state));
  document.body.addEventListener("keyup", (e) => onKeyUp(e, state));

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
  );
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );

  scene.add(plane);
  scene.add(sphere);

  camera.position.z = 5; // move camera backwards so we can see the objects
}

// define the animation loop function which will run ones per frame (typically 60fps)
function animate() {
  const cameraDir = updateCameraPosition(camera, state);

  renderer.render(scene, camera);
}

setup();
renderer.setAnimationLoop(animate); // start the animation loop
