import * as THREE from "three";
import { AssetsFactory } from "./AssetsFactory";
import { City } from "./City";
import { BaseBuilding } from "./models/BaseBuilding";
import { getBuildingType } from "./helpers/getBuildingType";
import { Road } from "./models/Road";

const SELECTED_COLOR = 0xaaaa55;
const HIGHLIGHTED_COLOR = 0x555555;

export class Scene {
  private scene = new THREE.Scene();
  private assetsFactory = new AssetsFactory(this.onLoad.bind(this));

  private raycaster = new THREE.Raycaster();
  private renderer = new THREE.WebGLRenderer({ alpha: true });
  private mouse = new THREE.Vector2();

  private isLoading = true;
  private lastRaycast: number = -1;

  private selectedObject: THREE.Object3D<THREE.Object3DEventMap> | undefined =
    undefined;
  private hoverObject: THREE.Object3D<THREE.Object3DEventMap> | undefined =
    undefined;

  private terrain: THREE.Group<THREE.Object3DEventMap>[][] = [];
  private buildings: (THREE.Group<THREE.Object3DEventMap> | undefined)[][] = [];

  constructor(private camera: THREE.Camera, private gameOnLoad: () => void) {
    if (!this.isLoading) {
      this.setup();
    }
  }

  private onLoad() {
    this.isLoading = false;

    this.setup();
    this.gameOnLoad();
  }

  private setup() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setAnimationLoop(() =>
      this.renderer?.render(this.scene, this.camera)
    );
    document.body.appendChild(this.renderer.domElement);
  }

  async initialize(instance: City) {
    this.scene.clear();

    const city = instance.data;

    for (let x = 0; x < city.length; x++) {
      const column: THREE.Group<THREE.Object3DEventMap>[] = [];

      for (let y = 0; y < city[x].length; y++) {
        const tile = city[x][y];
        // 1. Load the mesh / 3D object corresponding to the tile at (x, y) coordinates
        // 2. Add that mesh to the scene

        const terrain = tile.terrain;
        const grass = this.assetsFactory.getModel("grass", terrain);
        grass.receiveShadow = true;
        grass.position.set(x, 0, y);
        this.scene.add(grass);
        column.push(grass);
      }

      this.terrain.push(column);
      this.buildings.push(new Array(city.length).fill(undefined));
    }

    this.setupLights();
  }

  async updateScene(instance: City) {
    const city = instance.data;

    for (let x = 0; x < city.length; x++) {
      for (let y = 0; y < city[x].length; y++) {
        const tile = city[x][y];

        const buildingTypeOnTheScene = this.buildings[x][y];
        const buildingTypeInTheDataModel = tile.building;

        if (!buildingTypeInTheDataModel && buildingTypeOnTheScene) {
          this.scene.remove(buildingTypeOnTheScene);
          this.buildings[x][y] = undefined;
        } else if (
          (!buildingTypeOnTheScene && buildingTypeInTheDataModel) ||
          (buildingTypeInTheDataModel instanceof BaseBuilding &&
            buildingTypeInTheDataModel?.needsUpdate)
        ) {
          if (buildingTypeOnTheScene) {
            this.scene.remove(buildingTypeOnTheScene);
          }

          const newBuilding = this.assetsFactory.getModel(
            getBuildingType(buildingTypeInTheDataModel),
            buildingTypeInTheDataModel
          );

          newBuilding.position.set(x, 0.02, y);

          this.buildings[x][y] = newBuilding;
          this.scene.add(newBuilding);

          if (buildingTypeInTheDataModel instanceof BaseBuilding) {
            buildingTypeInTheDataModel.needsUpdate = false;
          }

          if (buildingTypeInTheDataModel instanceof Road) {
            newBuilding.rotateY(buildingTypeInTheDataModel.rotation.y);
          }
        }
      }
    }
  }

  setActiveObject(object: THREE.Object3D<THREE.Object3DEventMap>) {
    this.selectedObject = object;
  }

  setHoverObject(object: THREE.Object3D<THREE.Object3DEventMap>) {
    this.hoverObject = object;
  }

  highlightSelected() {
    if (this.selectedObject) {
      this.highlightObject(SELECTED_COLOR, this.selectedObject);
    }
  }

  highlightHover(hoverObject: THREE.Object3D<THREE.Object3DEventMap>) {
    if (this.hoverObject) {
      this.dimObject(this.hoverObject);
    }

    this.highlightObject(HIGHLIGHTED_COLOR, hoverObject);
  }

  getActiveObject() {
    return this.selectedObject;
  }

  private highlightObject(
    color: number,
    object: THREE.Object3D<THREE.Object3DEventMap>
  ) {
    // look into other ways to do it

    if (object) {
      const mesh = object as THREE.Mesh;
      mesh.traverse((obj) => {
        if (Array.isArray(obj.material)) {
          obj.material?.forEach((m) => m.emissive?.setHex(color));
        }
        obj.material?.emissive?.setHex(color);
      });
    }
  }

  private dimObject(object: THREE.Object3D<THREE.Object3DEventMap>) {
    // look into other ways to do it

    if (object) {
      const mesh = object as THREE.Mesh;
      mesh.traverse((obj) => {
        if (Array.isArray(obj.material)) {
          obj.material?.forEach((m) => m.emissive?.setHex(0));
        }

        obj.material?.emissive?.setHex(0);
      });
    }
  }

  private setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(-10, 20, 0);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }

  castRay(e: MouseEvent) {
    if (Date.now() - this.lastRaycast < 1 / 20) return this.selectedObject;
    // look this up if you have no idea
    // what this is
    this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // layers optimization

    const intersections = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersections.length) {
      return intersections[0].object;
    }
  }

  onMouseDown(e: MouseEvent) {
    const clickedObject = this.castRay(e);

    if (clickedObject) {
      this.dimObject(clickedObject);
      this.highlightObject(SELECTED_COLOR, clickedObject);
    }

    return clickedObject;
  }
}
