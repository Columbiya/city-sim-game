import { BaseBuilding } from "../models/BaseBuilding";
import { Road } from "../models/Road";

export const isGrowable = (
  building: BaseBuilding | Road
): building is BaseBuilding => {
  return (
    building.type === "building" ||
    building.type === "commercial" ||
    building.type === "industrial" ||
    building.type === "residential"
  );
};
