import * as THREE from "three";
import {
  MAX_CAMERA_RADIUS,
  MIDDLE_MOUSE_BUTTON,
  MIN_CAMERA_RADIUS,
  RIGHT_MOUSE_BUTTON,
  Y_AXIS,
} from "./constants";
import { DEG2RAD } from "./constants";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  let cameraOrigin = new THREE.Vector3();
  let cameraRadius = (MIN_CAMERA_RADIUS + MAX_CAMERA_RADIUS) / 2;
  let cameraAzimuth = 135;
  let cameraElevation = 45;

  let isRotating = false;
  let isZooming = false;
  let isPanning = false;

  let prevMouseX = 0;
  let prevMouseY = 0;

  updateCameraPosition();

  function onMouseDown(event: MouseEvent) {
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;

    event.preventDefault();

    if (
      event.button === RIGHT_MOUSE_BUTTON &&
      (event.altKey || event.shiftKey)
    ) {
      isZooming = true;
    } else if (event.button === RIGHT_MOUSE_BUTTON) {
      isRotating = true;
    } else if (event.button === MIDDLE_MOUSE_BUTTON) {
      isPanning = true;
    }
  }

  function onTouchDown(event: TouchEvent) {
    prevMouseX = event.touches[0].clientX;
    prevMouseY = event.touches[0].clientY;
  }

  function onMouseMove(event: MouseEvent) {
    const dx = event.clientX - prevMouseX;
    const dy = event.clientY - prevMouseY;

    // handles the rotation of the camera
    if (isRotating) {
      cameraAzimuth += dx * 0.5;
      cameraElevation += dy * 0.5;
      cameraElevation = Math.min(90, Math.max(0, cameraElevation));

      updateCameraPosition();
    }

    // handles the panning of the camera
    if (isPanning) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        Y_AXIS,
        cameraAzimuth * DEG2RAD
      );
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        Y_AXIS,
        cameraAzimuth * DEG2RAD
      );

      cameraOrigin.add(forward.multiplyScalar(dy * -0.01));
      cameraOrigin.add(left.multiplyScalar(dx * -0.01));
      updateCameraPosition();
    }

    // handles the zoom of the camera
    if (isZooming) {
      cameraRadius += dy * 0.02;
      cameraRadius = Math.min(
        MAX_CAMERA_RADIUS,
        Math.max(MIN_CAMERA_RADIUS, cameraRadius)
      );
      updateCameraPosition();
    }

    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
  }

  function updateCameraPosition() {
    camera.position.x =
      cameraRadius *
      Math.sin(cameraAzimuth * DEG2RAD) *
      Math.cos(cameraElevation * DEG2RAD);
    camera.position.y = cameraRadius * Math.sin(cameraElevation * DEG2RAD);
    camera.position.z =
      cameraRadius *
      Math.cos(cameraAzimuth * DEG2RAD) *
      Math.cos(cameraElevation * DEG2RAD);

    camera.position.add(cameraOrigin);
    camera.lookAt(cameraOrigin);
    camera.updateMatrix();
  }

  function onMouseUp(event: MouseEvent) {
    if (
      event.button === RIGHT_MOUSE_BUTTON &&
      (event.altKey || event.shiftKey)
    ) {
      isZooming = false;
    } else if (event.button === RIGHT_MOUSE_BUTTON) {
      isRotating = false;
    } else if (event.button === MIDDLE_MOUSE_BUTTON) {
      isPanning = false;
    }
  }

  return { onMouseDown, onMouseUp, onMouseMove, onTouchDown, camera };
}
