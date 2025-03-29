import { BaseBuilding } from "./models/BaseBuilding";
import { CommercialBuilding } from "./models/CommercialBuilding";
import { IndustrialBuilding } from "./models/IndustrialBuilding";
import { ResidentialBuilding } from "./models/ResidentialBuilding";
import { Road } from "./models/Road";
import { Buildings } from "./types/Building";

export class BuildingsFactory {
  createBuilding(type: Buildings, x: number, y: number) {
    switch (type) {
      case "building":
        return new BaseBuilding(x, y);
      case "commercial":
        return new CommercialBuilding(x, y);
      case "industrial":
        return new IndustrialBuilding(x, y);
      case "residential":
        return new ResidentialBuilding(x, y);
      case "road":
        return new Road(x, y);
      default:
        throw new Error("The typed passed in the method is not supported");
    }
  }
}
