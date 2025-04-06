import { isGrowable } from "./helpers/isGrowable";
import { isResidentialBuilding } from "./helpers/isResidentialBuilding";
import { Citizen } from "./models/Citizen";
import { Grass } from "./models/Grass";
import { CityTile } from "./types/City";
import { WorkerClient, WorkerPayload, WorkerResponse } from "./WorkerClient";

export class City {
  citizens: Citizen[] = [];
  data: CityTile[][] = [];
  wc = new WorkerClient();

  payload: WorkerPayload[] = [];

  constructor(size: number) {
    for (let x = 0; x < size; x++) {
      const col: CityTile[] = [];

      for (let y = 0; y < size; y++) {
        col.push({
          id: crypto.randomUUID(),
          x,
          y,
          terrain: new Grass(x, y),
          building: undefined,
        });
      }

      this.data.push(col);

      this.wc.worker.onerror = (e) => console.log(e.message);

      this.wc.worker.onmessage = (e) => {
        const citizenTilesMap = e.data as WorkerResponse;

        for (const c of this.citizens) {
          const position = citizenTilesMap.get(c.id);

          if (position === undefined) continue;

          if (position === null) {
            c.findJob(position);
            return;
          }

          const [x, y] = position;

          c.findJob(this.data[x][y]);
        }
      };
    }
  }

  update() {
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        const tile = this.data[i][j];

        const random = Math.random();

        if (tile.building && isGrowable(tile.building)) {
          if (tile.building.isUnderConstruction) {
            tile.building.construct();
            continue;
          }

          if (random > 0.2) {
            tile.building.grow();
          }
        }

        if (tile.building && isResidentialBuilding(tile.building)) {
          this.payload = [];

          for (const r of tile.building.residents) {
            if (r.jobState === "employed") continue;

            this.payload.push({
              type: "findClosestJob",
              citizenId: r.id,
              startx: tile.x,
              starty: tile.y,
              maxDistance: 5,
              city: this.data,
            });
          }

          this.wc.worker.postMessage(this.payload);

          tile.building.residents.forEach((r) => {
            if (r.jobState === "unemployed") {
              r.jobStateTick();
            }
          });
        }

        if (
          tile.building &&
          random < 0.1 &&
          isResidentialBuilding(tile.building)
        ) {
          const citizen = Citizen.generateRandomCitizen(tile.building);
          tile.building.addResident(citizen);
          this.citizens.push(citizen);
        }
      }
    }

    return this.data;
  }

  excludeCitizens(citizens: Citizen[]) {
    this.citizens = this.citizens.filter((c) => citizens.includes(c));
  }

  getPopulation() {
    return this.citizens.length;
  }
}
