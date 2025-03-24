import { Buildings } from "../types/Building";
import { BaseBuilding } from "./BaseBuilding";

export class CommercialBuilding extends BaseBuilding {
  type: Extract<Buildings, "commercial"> = "commercial";
}
