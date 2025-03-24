import { MAX_BUILDING_HEIGHT } from "../constants";
import { Buildings } from "../types/Building";

export class BaseBuilding {
  type: Buildings = "building";
  height: number = 1;
  style: number;
  x: number = -1;
  y: number = -1;

  constructor() {
    this.style = Math.floor(3 * Math.random()) + 1;
  }

  grow() {
    if (this.height >= MAX_BUILDING_HEIGHT) return;

    this.height++;
    console.log("grew");
  }
}
