import * as THREE from "three";

// constants
const SPEED = 0.05;

export function updateCameraPosition(camera, state) {
  const cameraDir = camera
    .getWorldDirection(new THREE.Vector3())
    .clone()
    .normalize();

  const cameraDirWithoutY = cameraDir.clone();
  cameraDirWithoutY.y = 0;

  const cameraDirLeft = new THREE.Vector3();
  cameraDirLeft.crossVectors(camera.up, cameraDir);

  if (state.keyboard.forward) {
    camera.position.addScaledVector(cameraDirWithoutY, SPEED);
  }
  if (state.keyboard.backward) {
    camera.position.addScaledVector(cameraDirWithoutY, -SPEED);
  }
  if (state.keyboard.left) {
    camera.position.addScaledVector(cameraDirLeft, SPEED);
  }
  if (state.keyboard.right) {
    camera.position.addScaledVector(cameraDirLeft, -SPEED);
  }

  return cameraDir;
}
