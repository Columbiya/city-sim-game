import { City } from "../City";
import { DEG2RAD, ROAD_ACCESS_DISTANCE } from "../constants";
import { findClosestTiles } from "../helpers/findClosestTile";
import { Buildings } from "../types/Building";
import { CityTile } from "../types/City";
import { BaseBuilding } from "./BaseBuilding";
import type { ModelKeys } from "../types/Building";

type RemoveRoadTypeFromModelKey<T extends ModelKeys> =
  T extends `${infer BuildingType}-${infer ModelKey}` ? ModelKey : never;

type Style = RemoveRoadTypeFromModelKey<
  Extract<
    ModelKeys,
    | "road-corner"
    | "road-end"
    | "road-four-way"
    | "road-straight"
    | "road-three-way"
  >
>;
export class Road {
  type: Extract<Buildings, "road"> = "road";
  style: Style = "straight";
  rotation: { y: number; x: number } = { y: 0, x: 0 };

  constructor(public x: number, public y: number) {}

  toHTML() {
    return `<div>
      <div><span class="subtitle">Type:</span> ${this.type}</div> 
    </div>`;
  }

  calculateStyle(c: City) {
    const city = c.data;

    // Check which adjacent tiles are roads
    let top = city[this.x][this.y - 1]?.building?.type === this.type;
    let bottom = city[this.x][this.y + 1]?.building?.type === this.type;
    let left = city[this.x - 1][this.y]?.building?.type === this.type;
    let right = city[this.x + 1][this.y]?.building?.type === this.type;

    // Check all combinations
    // Four-way intersection
    if (top && bottom && left && right) {
      this.style = "four-way";
      this.rotation.y = 0;
      // T intersection
    } else if (!top && bottom && left && right) {
      // bottom-left-right
      this.style = "three-way";
      this.rotation.y = 0;
    } else if (top && !bottom && left && right) {
      // top-left-right
      this.style = "three-way";
      this.rotation.y = 180 * DEG2RAD;
    } else if (top && bottom && !left && right) {
      // top-bottom-right
      this.style = "three-way";
      this.rotation.y = 90 * DEG2RAD;
    } else if (top && bottom && left && !right) {
      // top-bottom-left
      this.style = "three-way";
      this.rotation.y = 270 * DEG2RAD;
      // Corner
    } else if (top && !bottom && left && !right) {
      // top-left
      this.style = "corner";
      this.rotation.y = 180 * DEG2RAD;
    } else if (top && !bottom && !left && right) {
      // top-right
      this.style = "corner";
      this.rotation.y = 90 * DEG2RAD;
    } else if (!top && bottom && left && !right) {
      // bottom-left
      this.style = "corner";
      this.rotation.y = 270 * DEG2RAD;
    } else if (!top && bottom && !left && right) {
      // bottom-right
      this.style = "corner";
      this.rotation.y = 0;
      // Straight
    } else if (top && bottom && !left && !right) {
      // top-bottom
      this.style = "straight";
      this.rotation.y = 0;
    } else if (!top && !bottom && left && right) {
      // left-right
      this.style = "straight";
      this.rotation.y = 90 * DEG2RAD;
      // Dead end
    } else if (top && !bottom && !left && !right) {
      // top
      this.style = "end";
      this.rotation.y = 180 * DEG2RAD;
    } else if (!top && bottom && !left && !right) {
      // bottom
      this.style = "end";
      this.rotation.y = 0;
    } else if (!top && !bottom && left && !right) {
      // left
      this.style = "end";
      this.rotation.y = 270 * DEG2RAD;
    } else if (!top && !bottom && !left && right) {
      // right
      this.style = "end";
      this.rotation.y = 90 * DEG2RAD;
    }
  }

  addRoadAccessToAdjacentCellsWithinDistanceOf(distance: number, c: City) {
    const city = c.data;
    const searchCriteria = (tile: CityTile) => {
      if (!tile.building) return false;

      const type = tile.building.type;

      return (
        type === "building" ||
        type === "commercial" ||
        type === "industrial" ||
        type === "residential"
      );
    };

    const tiles = findClosestTiles({
      startx: this.x,
      starty: this.y,
      searchCriteria,
      maxDistance: distance,
      city,
    });

    tiles.forEach((tile) => {
      if (tile.building instanceof BaseBuilding) {
        tile.building.setRoadAccess(true);
      }
    });
  }

  dispose(c: City) {
    const city = c.data;
    const searchCriteria = (tile: CityTile) => tile.building?.type === "road";

    const tiles = findClosestTiles({
      startx: this.x,
      starty: this.y,
      searchCriteria,
      maxDistance: ROAD_ACCESS_DISTANCE,
      city,
    });

    tiles.forEach((tile) => {
      if (tile.building instanceof BaseBuilding) {
        tile.building.setRoadAccess(false);
      }
    });
  }
}
