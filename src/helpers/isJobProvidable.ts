import { BaseBuilding } from "../models/BaseBuilding";
import { CommercialBuilding } from "../models/CommercialBuilding";
import { IndustrialBuilding } from "../models/IndustrialBuilding";
import { Road } from "../models/Road";

export const isJobProvidable = (
  building: BaseBuilding | Road
): building is CommercialBuilding | IndustrialBuilding => {
  return building.type === "commercial" || building.type === "industrial";
};
