import * as THREE from "three";
import { createCamera } from "./createCamera";
import { City } from "./types/City";
import { AssetsFactory } from "./AssetsFactory";
import { isGrowable } from "./isGrowable";

export function createScene() {
  const { camera, onMouseDown, onMouseMove, onMouseUp, onTouchDown } =
    createCamera();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777777);

  const assetsFactory = new AssetsFactory();

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
  document.body.appendChild(renderer.domElement);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedObject: THREE.Object3D<THREE.Object3DEventMap> | undefined =
    undefined;

  let terrain: THREE.Mesh[][] = [];
  let buildings: (THREE.Mesh | undefined)[][] = [];

  let onObjectSelected:
    | ((object: THREE.Object3D<THREE.Object3DEventMap> | undefined) => void)
    | undefined = undefined;

  function initialize(city: City) {
    scene.clear();

    for (let x = 0; x < city.length; x++) {
      const column: THREE.Mesh[] = [];

      for (let y = 0; y < city[x].length; y++) {
        const tile = city[x][y];
        // 1. Load the mesh / 3D object corresponding to the tile at (x, y) coordinates
        // 2. Add that mesh to the scene

        // Grass geometry
        const terrain = tile.terrain;
        const grass = assetsFactory.createAsset(terrain, x, y, undefined);
        scene.add(grass);
        column.push(grass);
      }

      terrain.push(column);
      buildings.push(new Array(city.length).fill(undefined));
    }

    setupLights();
  }

  function update(city: City) {
    for (let x = 0; x < city.length; x++) {
      for (let y = 0; y < city[x].length; y++) {
        const tile = city[x][y];

        const buildingTypeOnTheScene = buildings[x][y];
        const buildingTypeInTheDataModel = tile.building;

        if (!buildingTypeInTheDataModel && buildingTypeOnTheScene) {
          scene.remove(buildingTypeOnTheScene);
          buildings[x][y] = undefined;
          console.log("buldozed");
        } else if (buildingTypeInTheDataModel && !buildingTypeOnTheScene) {
          const newBuilding = assetsFactory.createAsset(
            buildingTypeInTheDataModel,
            x,
            y,
            // @ts-ignore
            buildingTypeInTheDataModel
          );

          newBuilding.position.set(x, 0.5, y);
          buildings[x][y] = newBuilding;
          scene.add(newBuilding);
        } else if (
          buildingTypeOnTheScene &&
          buildingTypeInTheDataModel &&
          isGrowable(buildingTypeInTheDataModel) &&
          buildingTypeOnTheScene?.userData.prevHeight !==
            buildingTypeInTheDataModel.height
        ) {
          scene.remove(buildingTypeOnTheScene);

          const newBuilding = assetsFactory.createAsset(
            buildingTypeInTheDataModel,
            x,
            y,
            buildingTypeInTheDataModel
          );
          buildings[x][y] = newBuilding;
          scene.add(newBuilding);
        }
      }
    }
  }

  function setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(20, 20, 20);
    sun.castShadow = true;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 0;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;

    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  }

  function setObjectSelectedHandler(
    handler: (_: THREE.Object3D<THREE.Object3DEventMap> | undefined) => void
  ) {
    onObjectSelected = handler;
  }

  function onMouseDownScene(e: MouseEvent) {
    onMouseDown(e);

    // look this up if you have no idea
    // what this is
    mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersections = raycaster.intersectObjects(scene.children, false);

    if (intersections.length) {
      selectedObject = intersections[0].object;

      if (onObjectSelected) {
        onObjectSelected(selectedObject);
      }
    }
  }

  return {
    onMouseUp,
    onTouchDown,
    onMouseMove,
    onMouseDown: onMouseDownScene,
    initialize,
    update,
    setObjectSelectedHandler,
  };
}
