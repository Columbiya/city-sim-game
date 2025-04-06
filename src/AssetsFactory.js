import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { models as modelPaths } from "./assets/models";

export class AssetsFactory {
  textureLoader = new THREE.TextureLoader();
  gltfLoader = new GLTFLoader();
  textures = {
    base: this.loadTexture(`textures/base.png`),
    specular: this.loadTexture(`textures/specular.png`),
    grid: this.loadTexture("textures/grid.png"),
    grass: this.loadTexture("/grass.png"),
  };
  loadedModelCount = 0;
  modelCount = 0;

  constructor(onLoad) {
    this.modelCount = Object.keys(modelPaths).length;
    this.loadModels();
    this.models = {};
    this.onLoad = onLoad;
  }

  loadModel(
    name,
    {
      filename,
      scale = 1,
      rotation = 0,
      receiveShadow = true,
      castShadow = true,
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

  loadModels() {
    for (const [name, meta] of Object.entries(modelPaths)) {
      this.loadModel(name, meta);
    }
  }

  getModel(name, simObject, transparent = false) {
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

  loadTexture(url, flipY = false) {
    const texture = this.textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = flipY;
    return texture;
  }
}
