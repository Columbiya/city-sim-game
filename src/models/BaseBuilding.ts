import { MAX_BUILDING_HEIGHT, ROAD_ACCESS_DISTANCE } from "../constants";
import { findClosestTile } from "../helpers/findClosestTile";
import { getRandomInt } from "../helpers/getRandomInt";
import { Buildings } from "../types/Building";
import { City, CityTile } from "../types/City";

const styles = ["A", "B", "C"] as const;

export class BaseBuilding {
  id = crypto.randomUUID();
  type: Buildings = "building";
  height: number = 1;
  style: "A" | "B" | "C";

  isDeveloped = false;

  needsUpdate = false;

  isUnderConstruction = true;
  stepsToBuild = 3;

  roadAccess = false;
  abandoned = false;
  hasHadRoadAccess = false;

  constructor(public x: number, public y: number) {
    this.style = styles[getRandomInt(0, 2)];
  }

  grow() {
    if (this.height >= MAX_BUILDING_HEIGHT) return;

    this.height++;

    if (this.height === MAX_BUILDING_HEIGHT) {
      this.isDeveloped = true;
    }

    this.needsUpdate = true;
  }

  construct() {
    if (!this.isUnderConstruction || !this.roadAccess) return;

    this.stepsToBuild--;

    if (this.stepsToBuild === 0) {
      this.isUnderConstruction = false;
      this.needsUpdate = true;
    }
  }

  setRoadAccess(value: boolean) {
    if (!value && this.hasHadRoadAccess) {
      this.abandoned = true;
    }

    this.roadAccess = value;
    this.hasHadRoadAccess = true;
    this.needsUpdate = true;
  }

  checkRoadAccess(city: City) {
    const searchCriteria = (tile: CityTile) => {
      if (!tile.building) return false;

      const type = tile.building.type;

      return type === "road";
    };

    const tile = findClosestTile({
      startx: this.x,
      starty: this.y,
      searchCriteria,
      maxDistance: ROAD_ACCESS_DISTANCE,
      city,
    });

    if (!!tile !== this.hasHadRoadAccess) {
      this.needsUpdate = true;
    }

    this.setRoadAccess(!!tile);
  }

  toHTML() {
    return `<div>
      <div><span class="subtitle">Type:</span> ${this.type}</div> 
      <div><span class="subtitle">Style:</span> ${this.style}</div>
      <div><span class="subtitle">Height:</span> ${this.height}</div>
    </div>`;
  }
}
