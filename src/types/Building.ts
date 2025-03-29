import { models } from "../assets/models";

export type BasicBuilding =
  | "building"
  | "residential"
  | "commercial"
  | "industrial"
  | "road";

export type Buildings = BasicBuilding;
export type ModelKeys = keyof typeof models;
