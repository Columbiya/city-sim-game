import { BaseBuilding } from "../models/BaseBuilding";
import { Road } from "../models/Road";
import { Terrains } from "./Terrain";

export type CityTile = {
  id: string;
  x: number;
  y: number;
  building: BaseBuilding | Road | undefined;
  terrain: Terrains;
};

export type City = CityTile[][];
