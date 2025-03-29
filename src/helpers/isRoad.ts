import { BaseBuilding } from "../models/BaseBuilding";
import { Road } from "../models/Road";

export const isRoad = (building: BaseBuilding | Road): building is Road =>
  building.type === "road";
