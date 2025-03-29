import { BaseBuilding } from "../models/BaseBuilding";
import { ResidentialBuilding } from "../models/ResidentialBuilding";
import { Road } from "../models/Road";

export const isResidentialBuilding = (
  building: BaseBuilding | Road
): building is ResidentialBuilding => {
  return building.type === "residential";
};
