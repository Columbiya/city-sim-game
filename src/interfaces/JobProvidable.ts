import { Citizen } from "../models/Citizen";

export interface JobProvidable {
  workers: Set<Citizen>;
  maxWorkers: number;

  hire(citizen: Citizen): void;
  fireCitizen(citizen: Citizen): void;
  numberOfJobsAvailable(): number;
  numberOfJobsFilled(): number;
  dispose(): void;
}
