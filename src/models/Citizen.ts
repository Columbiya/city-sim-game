import { namesByGender } from "../constants";
import { getRandomInt } from "../helpers/getRandomInt";
import { CityTile } from "../types/City";
import { BaseBuilding } from "./BaseBuilding";

type Gender = "male" | "female";
type JobStates = "employed" | "unemployed";

export class Citizen {
  id = crypto.randomUUID();
  jobState: JobStates = "unemployed";
  jobStateTicks: number = 0; // the number of ticks the citizen in the current job state
  job: CityTile | null = null; // A reference to the building where the citizen works

  constructor(
    public name: string,
    public age: number,
    public gender: Gender,
    public house?: BaseBuilding
  ) {}

  moveIn(house: BaseBuilding) {
    this.house = house;
  }

  jobStateTick() {
    switch (this.jobState) {
      case "employed":
        if (!this.job) {
          this.jobState = "unemployed";
        }
        break;
    }
  }

  findJob(tile: CityTile | null) {
    this.job = tile;
    this.jobState = tile ? "employed" : "unemployed";

    // if (!this.house) return null;

    // const searchCriteria = (tile: CityTile) => {
    //   if (!tile.building) return false;

    //   return (
    //     isJobProvidable(tile.building) &&
    //     tile.building.numberOfJobsAvailable() >= 1
    //   );
    // };

    // const jobProvidableTile = city.findClosestTile(
    //   this.house.x,
    //   this.house.y,
    //   searchCriteria,
    //   10
    // );

    // if (!jobProvidableTile) return null;

    // if (
    //   jobProvidableTile.building &&
    //   isJobProvidable(jobProvidableTile.building)
    // ) {
    //   jobProvidableTile.building.hire(this);
    //   return jobProvidableTile;
    // }

    // return null;
  }

  getFired() {
    this.job = null;
    this.jobState = "unemployed";
  }

  static generateRandomCitizen(house: BaseBuilding): Citizen {
    const gender = Math.random() >= 0.5 ? "male" : "female";
    const randomNameNumber = getRandomInt(
      0,
      Math.min(namesByGender.female.length - 1, namesByGender.male.length - 1)
    );

    const randomName = namesByGender[gender][randomNameNumber];

    return new Citizen(randomName, getRandomInt(0, 60), gender, house);
  }

  toHTML() {
    return `<span class="citizen-info">Name: ${this.name}, Age: ${
      this.age
    }, job: ${this.jobState} ${
      this.job ? `worksAt: ${this.job.building?.type}` : ""
    }</span>`;
  }
}
