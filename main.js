import * as THREE from "three";
import { onKeyDown, onKeyUp, onMouseDown, onMouseUp } from "./eventListeners";
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
const pivotParent = new THREE.Object3D();
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5),
  new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
);
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  // new THREE.SphereGeometry(1),
  new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
const pivotPointBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  })
);
const raycaster = new THREE.Raycaster();

// state variables
const state = {
  keyboard: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },
  mouse: {
    isMouseDown: false,
    prevIsMouseDown: false,
  },
};

// rotation
let initialCameraQuat;
let initialObjectQuat;

// scale
let initialScale = 1;
let initialDist = 1;
let shouldPullBack = false;
let cameraPoint = null;

// setup function: we call this function only once at the beginning of the program to setup the scene
function setup() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  document.body.addEventListener("click", (e) => pointerLockControls.lock());
  document.body.addEventListener("keydown", (e) => onKeyDown(e, state));
  document.body.addEventListener("keyup", (e) => onKeyUp(e, state));
  document.body.addEventListener("mousedown", (e) => onMouseDown(e, state));
  document.body.addEventListener("mouseup", (e) => onMouseUp(e, state));

  scene.add(plane);
  scene.add(pivotParent);
  // scene.add(pivotPointBox);
  pivotParent.add(box);

  plane.geometry.computeBoundingBox();

  camera.position.z = 5; // move camera backwards so we can see the objects
}

// define the animation loop function which will run ones per frame (typically 60fps)
function animate() {
  const cameraDir = updateCameraPosition(camera, state);
  const cameraPos = camera.getWorldPosition(new THREE.Vector3()).clone();

  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  let intersects = raycaster.intersectObject(box);

  if (state.mouse.isMouseDown && intersects.length > 0) {
    const closestObj = intersects[0].object;
    const oneAwayFromCamera = cameraPos.clone().addScaledVector(cameraDir, 1);

    if (!state.mouse.prevIsMouseDown) {
      scene.attach(closestObj);
      pivotParent.position.copy(intersects[0].point);
      pivotParent.attach(closestObj);

      initialCameraQuat = camera.quaternion.clone();
      initialObjectQuat = pivotParent.quaternion.clone();

      initialScale = pivotParent.scale.x; // or y or z
      initialDist = cameraPos.distanceTo(pivotParent.position);

      pivotParent.position.copy(oneAwayFromCamera);
      const newDist = cameraPos.distanceTo(oneAwayFromCamera);
      const scaleFactor = newDist / initialDist;
      const scale = initialScale * scaleFactor;
      pivotParent.scale.set(scale, scale, scale);
    }

    // pivotPointBox.position.copy(intersects[0].point);

    pivotParent.position.copy(oneAwayFromCamera);

    const q_diff = camera.quaternion
      .clone()
      .multiply(initialCameraQuat.clone().invert());
    pivotParent.quaternion.copy(q_diff.multiply(initialObjectQuat));
  }

  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  let intersectsBox = raycaster.intersectObject(box);
  let intersectsPlane = raycaster.intersectObject(plane);
  if (
    !state.mouse.isMouseDown &&
    state.mouse.prevIsMouseDown &&
    intersectsBox.length == 1 &&
    intersectsPlane.length == 1
  ) {
    intersectsBox = intersectsBox[0];
    intersectsPlane = intersectsPlane[0];

    // move the box to the plane (without re-scale)
    scene.attach(box);
    pivotParent.position.copy(intersectsBox.point);
    pivotParent.attach(box);
    pivotParent.position.copy(intersectsPlane.point);
    cameraPoint = cameraPos.clone();
    shouldPullBack = true;
  }

  if (shouldPullBack) {
    const MAGNITUDE = 0.1;
    const pullbackDir = new THREE.Vector3().subVectors(
      cameraPoint,
      pivotParent.position
    );
    pivotParent.position.addScaledVector(pullbackDir, MAGNITUDE);
    const newDist = cameraPoint.distanceTo(pivotParent.position);
    const scaleFactor = newDist / initialDist;
    const scale = initialScale * scaleFactor;
    pivotParent.scale.set(scale, scale, scale);

    // Compute Bounding Boxes
    box.updateWorldMatrix(true);
    const boxBoundingBox = new THREE.Box3().setFromObject(box); // investigate what 'setFromObject' does
    const planeBoundingBox = new THREE.Box3().setFromObject(plane);

    // Check for Intersection
    const isIntersecting = boxBoundingBox.intersectsBox(planeBoundingBox);

    if (!isIntersecting) shouldPullBack = false;
  }

  state.mouse.prevIsMouseDown = state.mouse.isMouseDown;
  renderer.render(scene, camera);
}

setup();
renderer.setAnimationLoop(animate); // start the animation loop

// make it so that even if camera doesn't intersect plane, the side rays should be considered
// make it so that if on release doesn't intersect plane, should be more than 0.1 distance
