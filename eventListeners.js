//deleteme

export function onKeyDown(event, state) {
  switch (event.key) {
    case "w":
      state.keyboard.forward = true;
      break;
    case "s":
      state.keyboard.backward = true;
      break;
    case "a":
      state.keyboard.left = true;
      break;
    case "d":
      state.keyboard.right = true;
      break;
  }
}

export function onKeyUp(event, state) {
  switch (event.key) {
    case "w":
      state.keyboard.forward = false;
      break;
    case "s":
      state.keyboard.backward = false;
      break;
    case "a":
      state.keyboard.left = false;
      break;
    case "d":
      state.keyboard.right = false;
      break;
  }
}

export function onMouseDown(event, state) {
  state.mouse.isMouseDown = true;
}

export function onMouseUp(event, state) {
  state.mouse.isMouseDown = false;
}
