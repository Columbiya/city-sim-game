import { Buildings } from "../types/Building";
import { BaseBuilding } from "./BaseBuilding";

export class IndustrialBuilding extends BaseBuilding {
  type: Extract<Buildings, "industrial"> = "industrial";
}
