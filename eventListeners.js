export function onKeyDown(event, movingStates) {
  switch (event.key) {
    case "w":
      movingStates.forward = true;
      break;
    case "s":
      movingStates.backward = true;
      break;
    case "a":
      movingStates.left = true;
      break;
    case "d":
      movingStates.right = true;
      break;
  }
}

export function onKeyUp(event, movingStates) {
  switch (event.key) {
    case "w":
      movingStates.forward = false;
      break;
    case "s":
      movingStates.backward = false;
      break;
    case "a":
      movingStates.left = false;
      break;
    case "d":
      movingStates.right = false;
      break;
  }
}
