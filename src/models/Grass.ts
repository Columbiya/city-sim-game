export class Grass {
  type = "grass" as const;

  constructor(public x: number, public y: number) {}
}
