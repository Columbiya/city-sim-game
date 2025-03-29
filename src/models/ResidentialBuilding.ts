import { City } from "../City";
import { Buildings } from "../types/Building";
import { BaseBuilding } from "./BaseBuilding";
import { Citizen } from "./Citizen";

export class ResidentialBuilding extends BaseBuilding {
  type: Extract<Buildings, "residential"> = "residential";

  residents: Citizen[] = [];
  maxResidents = 4;

  addResident(citizen: Citizen) {
    if (this.residents.length < this.maxResidents) {
      this.residents.push(citizen);
    }

    return "The building is Full.";
  }

  dispose(city: City) {
    city.excludeCitizens(this.residents);
  }
}
