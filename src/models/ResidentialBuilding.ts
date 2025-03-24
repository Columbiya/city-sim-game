import { Buildings } from "../types/Building";
import { BaseBuilding } from "./BaseBuilding";

export class ResidentialBuilding extends BaseBuilding {
  type: Extract<Buildings, "residential"> = "residential";
}
