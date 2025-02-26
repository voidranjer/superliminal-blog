export function onKeyDown(event, state) {
  switch (event.key) {
    case "w":
      state.forward = true;
      break;
    case "s":
      state.backward = true;
      break;
    case "a":
      state.left = true;
      break;
    case "d":
      state.right = true;
      break;
  }
}

export function onKeyUp(event, state) {
  switch (event.key) {
    case "w":
      state.forward = false;
      break;
    case "s":
      state.backward = false;
      break;
    case "a":
      state.left = false;
      break;
    case "d":
      state.right = false;
      break;
  }
}
