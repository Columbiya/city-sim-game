import * as THREE from "three";
import { BaseBuilding } from "./models/BaseBuilding";
import { Road } from "./models/Road";
import { Grass } from "./models/Grass";

const geometry = new THREE.BoxGeometry(1, 1, 1);
const loader = new THREE.TextureLoader();

export class AssetsFactory {
  private textures = {
    grass: this.loadTexture("grass.png"),
    commercial1: this.loadTexture("commercial-1.png"),
    commercial2: this.loadTexture("commercial-2.png"),
    commercial3: this.loadTexture("commercial-3.png"),
    industrial1: this.loadTexture("industrial-1.png"),
    industrial2: this.loadTexture("industrial-2.png"),
    industrial3: this.loadTexture("industrial-3.png"),
    residential1: this.loadTexture("residential-1.png"),
    residential2: this.loadTexture("residential-2.png"),
    residential3: this.loadTexture("residential-3.png"),
  };

  private loadTexture(url: string) {
    const tex = loader.load(url);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
  }
  private getTopMaterial() {
    return new THREE.MeshLambertMaterial({ color: 0x555555 });
  }
  private getSideMaterial(textureName: keyof typeof this.textures) {
    return new THREE.MeshLambertMaterial({
      map: this.textures[textureName].clone(),
    });
  }
  private createGrass(x: number, y: number) {
    const material = new THREE.MeshLambertMaterial({
      map: this.textures.grass,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { type: "grass", x, y };
    mesh.position.set(x, -0.5, y);
    mesh.receiveShadow = true;
    return mesh;
  }
  private createBuilding(x: number, y: number, data: BaseBuilding) {
    return this.createMeshWithTextures(x, y, data);
  }
  private createResidential(x: number, y: number, data: BaseBuilding) {
    return this.createMeshWithTextures(x, y, data);
  }
  private createCommercial(x: number, y: number, data: BaseBuilding) {
    return this.createMeshWithTextures(x, y, data);
  }
  private createIndustrial(x: number, y: number, data: BaseBuilding) {
    return this.createMeshWithTextures(x, y, data);
  }
  private createRoad(x: number, y: number) {
    const m = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const mesh = new THREE.Mesh(geometry, m);
    mesh.userData = { type: "road", x, y };
    mesh.scale.set(1, 0.02, 1);
    mesh.position.set(x, 0.01, y);
    mesh.receiveShadow = true;
    return mesh;
  }

  private createMeshWithTextures(x: number, y: number, data: BaseBuilding) {
    const textureName = (data.type + data.style) as keyof typeof this.textures;

    const topMaterial = this.getTopMaterial();
    const sideMaterial = this.getSideMaterial(textureName);
    const materialsArray = [
      sideMaterial, // +X
      sideMaterial, // -X
      topMaterial, // +Y
      topMaterial, // -Y
      sideMaterial, // +Z
      sideMaterial, // -Z
    ];

    const mesh = new THREE.Mesh(geometry, materialsArray);
    mesh.userData = { model: data, x, y };
    mesh.scale.set(0.8, (data.height - 0.95) / 2, 0.8);
    mesh.material.forEach((m) => m.map?.repeat.set(1, data.height - 1));
    mesh.position.set(x, (data.height - 0.95) / 4, y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  createAsset<T extends BaseBuilding | Road | Grass>(
    building: T,
    x: number,
    y: number,
    buildingData: T["type"] extends "grass" | "road" ? undefined : BaseBuilding
  ): THREE.Mesh {
    switch (building.type) {
      case "grass":
        return this.createGrass(x, y);
      case "building":
        return this.createBuilding(x, y, buildingData!);
      case "commercial":
        return this.createCommercial(x, y, buildingData!);
      case "industrial":
        return this.createIndustrial(x, y, buildingData!);
      case "residential":
        return this.createResidential(x, y, buildingData!);
      case "road":
        return this.createRoad(x, y);
      default:
        console.log("Unknown asset type:", building);
        return new THREE.Mesh();
    }
  }
}
