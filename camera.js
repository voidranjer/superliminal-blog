import * as THREE from "three";

// constants
const SPEED = 0.05;

export function updateCameraPosition(camera, movingStates) {
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  cameraDir.normalize();

  const cameraDirWithoutY = cameraDir.clone();
  cameraDirWithoutY.y = 0;

  const cameraDirLeft = new THREE.Vector3();
  cameraDirLeft.crossVectors(camera.up, cameraDir);

  if (movingStates.forward) {
    camera.position.addScaledVector(cameraDirWithoutY, SPEED);
  }
  if (movingStates.backward) {
    camera.position.addScaledVector(cameraDirWithoutY, -SPEED);
  }
  if (movingStates.left) {
    camera.position.addScaledVector(cameraDirLeft, SPEED);
  }
  if (movingStates.right) {
    camera.position.addScaledVector(cameraDirLeft, -SPEED);
  }

  return cameraDir;
}
