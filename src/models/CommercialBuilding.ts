import { JobProvidable } from "../interfaces/JobProvidable";
import { Buildings } from "../types/Building";
import { BaseBuilding } from "./BaseBuilding";
import { Citizen } from "./Citizen";

export class CommercialBuilding extends BaseBuilding implements JobProvidable {
  type: Extract<Buildings, "commercial"> = "commercial";

  workers: Set<Citizen> = new Set();
  maxWorkers = 5;

  hire(citizen: Citizen): void {
    this.workers.add(citizen);
  }

  fireCitizen(citizen: Citizen): void {
    this.workers.delete(citizen);
  }

  numberOfJobsAvailable() {
    return this.maxWorkers - this.workers.size;
  }

  numberOfJobsFilled() {
    return this.workers.size;
  }

  dispose(): void {
    this.workers.forEach((w) => w.getFired());
  }
}
