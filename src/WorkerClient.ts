import { City } from "./types/City";

export type WorkerPayload = {
  type: "findClosestJob";
  citizenId: string;
  startx: number;
  starty: number;
  maxDistance: number;
  city: City;
};

type CitizenId = string;
type X = number;
type Y = number;
export type WorkerResponse = Map<CitizenId, [X, Y]>;

export class WorkerClient {
  worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });

  private static instance: WorkerClient;

  constructor() {
    if (WorkerClient.instance) {
      return WorkerClient.instance;
    }

    WorkerClient.instance = this;
  }
}
