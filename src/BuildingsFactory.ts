import { BaseBuilding } from "./models/BaseBuilding";
import { CommercialBuilding } from "./models/CommercialBuilding";
import { IndustrialBuilding } from "./models/IndustrialBuilding";
import { ResidentialBuilding } from "./models/ResidentialBuilding";
import { Road } from "./models/Road";
import { Buildings } from "./types/Building";

export class BuildingsFactory {
  createBuilding(type: Buildings) {
    switch (type) {
      case "building":
        return new BaseBuilding();
      case "commercial":
        return new CommercialBuilding();
      case "industrial":
        return new IndustrialBuilding();
      case "residential":
        return new ResidentialBuilding();
      case "road":
        return new Road();
      default:
        throw new Error("The typed passed in the method is not supported");
    }
  }
}
