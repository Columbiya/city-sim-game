import { BuildingsFactory } from "./BuildingsFactory";
import { createCity } from "./createCity";
import { createScene } from "./scene";
import { Tools } from "./types/Tool";

export class Game {
  private activeToolId: Tools = "bulldoze-btn";
  private buildingsFactory = new BuildingsFactory();

  setup() {
    let {
      onMouseDown,
      onTouchDown,
      onMouseMove,
      onMouseUp,
      initialize,
      setObjectSelectedHandler,
      update: updateScene,
    } = createScene();

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("touchstart", onTouchDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    document.querySelector("#toolbar")?.addEventListener("click", (ev) => {
      const target = ev.target as HTMLElement;

      if (target.tagName !== "BUTTON") return;

      document
        .querySelector(`#${this.activeToolId}`)
        ?.classList.remove("selected");

      this.activeToolId = target.id as Tools;
      target?.classList.add("selected");
    });

    document.addEventListener("contextmenu", (event) => event.preventDefault());

    const { data: city, update: updateCity } = createCity(8);
    initialize(city);

    setObjectSelectedHandler((selected) => {
      if (!selected) return;

      const { x, y } = selected.userData;
      const tile = city[x][y];

      switch (this.activeToolId) {
        case "bulldoze-btn":
          tile.building = undefined;
          break;
        case "commercial-btn":
          if (tile.building) return;
          tile.building = this.buildingsFactory.createBuilding("commercial");
          break;
        case "industrial-btn":
          if (tile.building) return;
          tile.building = this.buildingsFactory.createBuilding("industrial");
          break;
        case "residential-btn":
          if (tile.building) return;
          tile.building = this.buildingsFactory.createBuilding("residential");
          break;
        case "road-btn":
          if (tile.building) return;
          tile.building = this.buildingsFactory.createBuilding("road");
          break;
        default:
          throw new Error("Tool id is not supported" + this.activeToolId);
      }

      updateScene(city);
    });

    setInterval(() => {
      const city = updateCity();
      updateScene(city);
    }, 3000);
  }
}
