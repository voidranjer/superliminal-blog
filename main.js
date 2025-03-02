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
  // new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(1),
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
  transform: {
    initialScale: 1,
    initialDist: undefined,
  },
};
let initialCameraQuat;
let initialObjectQuat;

// setup function: we call this function only once at the beginning of the program to setup the scene
function setup() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  document.body.addEventListener("click", (e) => pointerLockControls.lock());
  document.body.addEventListener("keydown", (e) => onKeyDown(e, state));
  document.body.addEventListener("keyup", (e) => onKeyUp(e, state));
  document.body.addEventListener("mousedown", (e) => onMouseDown(e, state));
  document.body.addEventListener("mouseup", (e) => onMouseUp(e, state));

  const sphere = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    // new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
  );

  scene.add(plane);
  scene.add(pivotParent);
  // scene.add(pivotPointBox);
  pivotParent.add(box);

  camera.position.z = 5; // move camera backwards so we can see the objects
}

// define the animation loop function which will run ones per frame (typically 60fps)
function animate() {
  const cameraDir = updateCameraPosition(camera, state);
  const cameraPos = camera.getWorldPosition(new THREE.Vector3()).clone();

  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  let intersects = raycaster.intersectObjects(pivotParent.children);

  if (state.mouse.isMouseDown && intersects.length > 0) {
    const closestObj = intersects[0].object;

    if (!state.mouse.prevIsMouseDown) {
      scene.attach(closestObj);
      pivotParent.position.copy(intersects[0].point);
      pivotParent.attach(closestObj);

      initialCameraQuat = camera.quaternion.clone();
      initialObjectQuat = pivotParent.quaternion.clone();

      const initialScale = pivotParent.scale.x; // or y or z
      const initialDist = cameraPos.distanceTo(pivotParent.position);
      const newPos = cameraPos.clone().addScaledVector(cameraDir, 0.1);

      pivotParent.position.copy(newPos);
      const newDist = cameraPos.distanceTo(newPos);
      const scaleFactor = newDist / initialDist;
      const scale = initialScale * scaleFactor;
      pivotParent.scale.set(scale, scale, scale);
    }

    pivotPointBox.position.copy(intersects[0].point);

    const newPos = cameraPos.clone().addScaledVector(cameraDir, 0.1);

    pivotParent.position.copy(newPos);

    const q_diff = camera.quaternion
      .clone()
      .multiply(initialCameraQuat.clone().invert());
    pivotParent.quaternion.copy(q_diff.multiply(initialObjectQuat));
  }

  const intersectsBox = raycaster.intersectObject(box);
  if (
    !state.mouse.isMouseDown &&
    state.mouse.prevIsMouseDown &&
    intersectsBox.length > 0
  ) {
    const NUM_RAYS = 1000; // Adjust for more coverage
    box.geometry.computeBoundingBox();
    const boundingBox = box.geometry.boundingBox.clone();
    boundingBox.applyMatrix4(box.matrixWorld);

    // draw bounding box
    // const boxVis = new THREE.Box3Helper(boundingBox, 0xffff00);
    // scene.add(boxVis);

    const pointsOnWall = [];
    const pointsOnWallWithBacksideIntersects = [];
    const backsideIntersects = [];

    for (let i = 0; i < NUM_RAYS; i++) {
      // generate random point within bounding box
      const randomPoint = new THREE.Vector3(
        THREE.MathUtils.lerp(
          boundingBox.min.x,
          boundingBox.max.x,
          Math.random()
        ),
        THREE.MathUtils.lerp(
          boundingBox.min.y,
          boundingBox.max.y,
          Math.random()
        ),
        THREE.MathUtils.lerp(
          boundingBox.min.z,
          boundingBox.max.z,
          Math.random()
        )
      );

      // draw line from camera to the random point
      // const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      // const points = [];
      // points.push(cameraPos);
      // points.push(randomPoint);
      // const geometry = new THREE.BufferGeometry().setFromPoints(points);
      // const line = new THREE.Line(geometry, material);
      // scene.add(line);

      // Compute ray direction from the camera to the random point
      const direction = new THREE.Vector3()
        .subVectors(randomPoint, cameraPos)
        .normalize();
      raycaster.set(cameraPos, direction);

      // Check for intersections with the background plane
      const intersects = raycaster.intersectObject(plane);
      if (intersects.length > 0) {
        const pointOnBg = intersects[0].point;
        pointsOnWall.push(pointOnBg);

        // draw each point on the wall (not just the selected one)
        // const sphereGeom = new THREE.SphereGeometry(0.01);
        // const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        // sphere.position.copy(pointOnBg);
        // scene.add(sphere);

        const pointToCamera = new THREE.Vector3()
          .subVectors(cameraPos, pointOnBg)
          .normalize();
        raycaster.set(pointOnBg, pointToCamera);

        const reverseIntersects = raycaster.intersectObject(box);
        if (reverseIntersects.length > 0) {
          pointsOnWallWithBacksideIntersects.push(pointOnBg);
          backsideIntersects.push(reverseIntersects[0].point);

          // draw the line from point on bg to the backside of the geometry
          // const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
          // const points = [];
          // points.push(pointOnBg);
          // points.push(reverseIntersects[0].point);
          // const geometry = new THREE.BufferGeometry().setFromPoints(points);
          // const line = new THREE.Line(geometry, material);
          // scene.add(line);

          // draw each point (not just the selected one)
          // const sphereGeom = new THREE.SphereGeometry(0.01);
          // const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          // const sphere = new THREE.Mesh(sphereGeom, sphereMat);
          // sphere.position.copy(reverseIntersects[0].point);
          // scene.add(sphere);
        }
      }
    }

    let minDist = Infinity;
    let indexOfLeastDistToWall = 0;

    for (let i = 0; i < pointsOnWallWithBacksideIntersects.length; i++) {
      const backsidePoint = backsideIntersects[i];
      const pointOnWall = pointsOnWallWithBacksideIntersects[i];

      const dist = backsidePoint.distanceTo(pointOnWall);
      if (dist < minDist) {
        minDist = dist;
        indexOfLeastDistToWall = i;
      }
    }

    // draw the point
    // const sphereGeom = new THREE.SphereGeometry(0.01);
    // const sphereMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    // const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    // sphere.position.copy(backsideIntersects[indexOfLeastDistToWall]);
    // scene.add(sphere);

    if (backsideIntersects.length !== 0) {
      // tp to wall
      scene.attach(box);
      pivotParent.position.copy(backsideIntersects[indexOfLeastDistToWall]);
      pivotParent.attach(box);

      const initialScale = pivotParent.scale.x; // or y or z
      const initialDist = cameraPos.distanceTo(pivotParent.position);

      const newPos = pointsOnWallWithBacksideIntersects[indexOfLeastDistToWall];

      pivotParent.position.copy(newPos);
      const newDist = cameraPos.distanceTo(newPos);
      const scaleFactor = newDist / initialDist;
      const scale = initialScale * scaleFactor;
      pivotParent.scale.set(scale, scale, scale);
    }
  }

  state.mouse.prevIsMouseDown = state.mouse.isMouseDown;

  renderer.render(scene, camera);
}

setup();
renderer.setAnimationLoop(animate); // start the animation loop

// make it so that even if camera doesn't intersect plane, the side rays should be considered
// make it so that if on release doesn't intersect plane, should be more than 0.1 distance
