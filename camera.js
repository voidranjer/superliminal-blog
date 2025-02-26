import * as THREE from "three";

// constants
const SPEED = 0.05;

export function updateCameraPosition(camera, state) {
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  cameraDir.normalize();

  const cameraDirWithoutY = cameraDir.clone();
  cameraDirWithoutY.y = 0;

  const cameraDirLeft = new THREE.Vector3();
  cameraDirLeft.crossVectors(camera.up, cameraDir);

  if (state.forward) {
    camera.position.addScaledVector(cameraDirWithoutY, SPEED);
  }
  if (state.backward) {
    camera.position.addScaledVector(cameraDirWithoutY, -SPEED);
  }
  if (state.left) {
    camera.position.addScaledVector(cameraDirLeft, SPEED);
  }
  if (state.right) {
    camera.position.addScaledVector(cameraDirLeft, -SPEED);
  }

  return cameraDir;
}
