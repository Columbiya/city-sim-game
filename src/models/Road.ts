import { Buildings } from "../types/Building";

export class Road {
  type: Extract<Buildings, "road"> = "road";
}
