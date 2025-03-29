import * as THREE from "three";
import { BaseBuilding } from "./models/BaseBuilding";
import { Road } from "./models/Road";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { models as modelPaths } from "./assets/models";
import { Grass } from "./models/Grass";

export class AssetsFactory {
  private textureLoader = new THREE.TextureLoader();
  private gltfLoader = new GLTFLoader();
  private textures = {
    base: this.loadTexture(`textures/base.png`),
    specular: this.loadTexture(`textures/specular.png`),
    grid: this.loadTexture("textures/grid.png"),
    grass: this.loadTexture("/grass.png"),
  };
  private loadedModelCount = 0;
  private modelCount = 0;

  private models: Record<
    keyof typeof modelPaths,
    THREE.Group<THREE.Object3DEventMap>
  >;

  constructor(private onLoad: () => void) {
    this.modelCount = Object.keys(modelPaths).length;
    this.loadModels();
    this.models = {} as Record<
      keyof typeof modelPaths,
      THREE.Group<THREE.Object3DEventMap>
    >;
  }

  private loadModel(
    name: keyof typeof modelPaths,
    {
      filename,
      scale = 1,
      rotation = 0,
      receiveShadow = true,
      castShadow = true,
    }: {
      filename: string;
      scale: number;
      rotation: number;
      receiveShadow: boolean;
      castShadow: boolean;
    }
  ) {
    this.gltfLoader.load(`/models/${filename}`, (glb) => {
      let mesh = glb.scene;

      mesh.name = filename;

      mesh.traverse((obj) => {
        if (obj.material) {
          obj.material = new THREE.MeshLambertMaterial({
            map: this.textures.base,
            specularMap: this.textures.specular,
          });
          obj.receiveShadow = receiveShadow;
          obj.castShadow = castShadow;
        }
      });

      mesh.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);
      mesh.scale.set(scale / 30, scale / 30, scale / 30);

      this.models[name] = mesh;

      // Once all models are loaded
      this.loadedModelCount++;
      if (this.loadedModelCount == this.modelCount) {
        this.onLoad();
      }
    });
  }

  private loadModels() {
    for (const [name, meta] of Object.entries(modelPaths)) {
      this.loadModel(name as keyof typeof modelPaths, meta);
    }
  }

  getModel(
    name: keyof typeof modelPaths,
    simObject: BaseBuilding | Road | Grass,
    transparent = false
  ) {
    const mesh = this.models[name].clone();

    mesh.traverse((obj) => {
      obj.userData = simObject;
      if (obj.material) {
        obj.material = obj.material.clone();
        obj.material.transparent = transparent;
      }
    });

    return mesh;
  }

  private loadTexture(url: string, flipY = false) {
    const texture = this.textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = flipY;
    return texture;
  }
}
