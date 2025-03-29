import { Object3D, Object3DEventMap, PerspectiveCamera } from "three";
import { BuildingsFactory } from "./BuildingsFactory";
import { createCamera } from "./createCamera";
import { Scene } from "./scene";
import { CityTile } from "./types/City";
import { Tools } from "./types/Tool";
import { LEFT_MOUSE_BUTTON, ROAD_ACCESS_DISTANCE } from "./constants";
import { City } from "./City";
import { isResidentialBuilding } from "./helpers/isResidentialBuilding";
import { isJobProvidable } from "./helpers/isJobProvidable";
import { isRoad } from "./helpers/isRoad";
import { BaseBuilding } from "./models/BaseBuilding";
import { tileToHTML } from "./helpers/tileToHTML";

export class Game {
  private activeToolId: Tools = "select-btn";
  private buildingsFactory = new BuildingsFactory();
  private leftMouseDown = false;

  private populationNumberHtmlElement =
    document.querySelector("#population-number")!;

  private infoBlock = document.querySelector("#info-block")!;
  private tileInfo = document.querySelector("#tile-info")!;
  private buildingInfoBlock = document.querySelector("#building-info-block")!;
  private buildingInfo = document.querySelector("#building-info")!;
  private residentsInfoBlock = document.querySelector("#residents-info-block")!;
  private residentsInfo = document.querySelector("#residents-info")!;

  private scene: Scene;
  private camera: PerspectiveCamera;
  private city: City;

  private isLoading = false;

  private simulationInterval: number = -1;
  private paused = false;
  private cameraEvents: {
    mousedown: (e: MouseEvent) => void;
    mouseup: (e: MouseEvent) => void;
    mousemove: (e: MouseEvent) => void;
    touchdown: (e: TouchEvent) => void;
  };

  constructor() {
    const {
      camera,
      onMouseDown: cameraOnMouseDown,
      onMouseUp: cameraOnMouseUp,
      onMouseMove: cameraOnMouseMove,
      onTouchDown: cameraOnTouchDown,
    } = createCamera();

    this.cameraEvents = {
      mousedown: cameraOnMouseDown,
      mouseup: cameraOnMouseUp,
      mousemove: cameraOnMouseMove,
      touchdown: cameraOnTouchDown,
    };
    this.camera = camera;
    this.scene = new Scene(camera, this.onLoad.bind(this));
    this.city = new City(6);
  }

  private onLoad() {
    this.isLoading = false;

    this.setup();
  }

  private setup() {
    const city = this.city.data;

    document.addEventListener("mousedown", (e) => {
      const selectedObject = this.scene.onMouseDown(e);
      this.cameraEvents.mousedown(e);

      if (!selectedObject) return;

      if (e.button === LEFT_MOUSE_BUTTON) {
        this.leftMouseDown = true;
      }

      const { x, y } = selectedObject.userData;
      const tile = city[x][y];

      this.handleTool(tile, this.scene, selectedObject);

      this.scene.updateScene(this.city);
    });
    document.addEventListener("touchstart", (e) => {
      this.cameraEvents.touchdown(e);
    });
    document.addEventListener("mousemove", (e) => {
      const hoverObject = this.scene.castRay(e);

      if (hoverObject) {
        if (
          this.leftMouseDown &&
          this.activeToolId !== "select-btn" &&
          this.activeToolId !== "bulldoze-btn"
        ) {
          const { x, y } = hoverObject.userData;

          const tile = city[x][y];

          if (tile.building) {
            return;
          }

          this.handleTool(tile, this.scene, hoverObject);
        }

        this.scene.updateScene(this.city);
        this.scene.highlightHover(hoverObject);
        this.scene.setHoverObject(hoverObject);
      }

      this.cameraEvents.mousemove(e);
    });
    document.addEventListener("mouseup", (e) => {
      this.cameraEvents.mouseup(e);

      this.leftMouseDown = false;
    });

    document.querySelector("#toolbar")?.addEventListener("click", (ev) => {
      const target = ev.target as HTMLElement;

      if (
        target.tagName !== "BUTTON" &&
        target.parentElement?.tagName !== "BUTTON"
      )
        return;

      const isIcon = target.tagName === "IMG";

      const toolId = isIcon ? target.parentElement?.id : target.id;

      document
        .querySelector(`#${this.activeToolId}`)
        ?.classList.remove("selected");

      this.activeToolId = toolId as Tools;

      if (this.activeToolId === "pause-btn") {
        const img = target?.children[0] as HTMLImageElement;

        if (this.paused) {
          this.startSimulation();
        } else {
          this.stopSimulation();
        }

        if (img) {
          img.src = this.paused ? "/icons/play.png" : "/icons/pause.png";
        }
      }
      isIcon
        ? target.parentElement?.classList.add("selected")
        : target?.classList.add("selected");
    });

    document.addEventListener("contextmenu", (event) => event.preventDefault());

    this.scene.initialize(this.city);
    this.startSimulation();
  }

  private updateInfobar() {
    this.populationNumberHtmlElement.innerHTML = this.city
      .getPopulation()
      .toString();
  }

  private startSimulation() {
    this.paused = false;
    this.simulationInterval = setInterval(() => {
      this.city.update();
      this.scene.updateScene(this.city);
      this.updateInfobar();
    }, 3000);
  }

  private stopSimulation() {
    this.paused = true;
    clearInterval(this.simulationInterval);
  }

  private handleInfoSidebar(tile: CityTile) {
    this.infoBlock.classList.remove("hidden");

    this.tileInfo.innerHTML = tileToHTML(tile);

    if (!tile.building) {
      this.buildingInfoBlock.classList.add("hidden");
      this.residentsInfoBlock.classList.add("hidden");

      return;
    }

    this.buildingInfoBlock.classList.remove("hidden");
    this.buildingInfo.innerHTML = tile.building.toHTML();

    if (isResidentialBuilding(tile.building)) {
      this.residentsInfoBlock.classList.remove("hidden");
      this.residentsInfo.innerHTML = tile.building.residents
        .map((r) => r.toHTML())
        .join("<br />");
      return;
    }

    this.residentsInfoBlock.classList.add("hidden");
  }

  private handleTool(
    tile: CityTile,
    scene: Scene,
    selectedObject: Object3D<Object3DEventMap>
  ) {
    switch (this.activeToolId) {
      case "select-btn":
        scene.setActiveObject(selectedObject);
        scene.highlightSelected();

        this.handleInfoSidebar(tile);
        break;
      case "bulldoze-btn":
        if (!tile.building) return;

        if (
          isJobProvidable(tile.building) ||
          isResidentialBuilding(tile.building) ||
          isRoad(tile.building)
        ) {
          const building = tile.building;
          tile.building = undefined;
          building.dispose(this.city);

          return;
        }

        tile.building = undefined;
        break;
      case "commercial-btn":
        if (tile.building) return;
        tile.building = this.buildingsFactory.createBuilding(
          "commercial",
          tile.x,
          tile.y
        );
        break;
      case "industrial-btn":
        if (tile.building) return;
        tile.building = this.buildingsFactory.createBuilding(
          "industrial",
          tile.x,
          tile.y
        );
        break;
      case "residential-btn":
        if (tile.building) return;
        tile.building = this.buildingsFactory.createBuilding(
          "residential",
          tile.x,
          tile.y
        );
        break;
      case "road-btn":
        if (tile.building) return;
        tile.building = this.buildingsFactory.createBuilding(
          "road",
          tile.x,
          tile.y
        );

        if (isRoad(tile.building)) {
          tile.building.addRoadAccessToAdjacentCellsWithinDistanceOf(
            ROAD_ACCESS_DISTANCE,
            this.city
          );
          tile.building.calculateStyle(this.city);
        }
        break;
      default:
        throw new Error("Tool id is not supported" + this.activeToolId);
    }

    if (tile.building instanceof BaseBuilding) {
      tile.building.checkRoadAccess(this.city.data);
    }
  }
}
