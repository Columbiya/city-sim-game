import { isGrowable } from "./isGrowable";
import { Grass } from "./models/Grass";
import { City, CityTile } from "./types/City";

const data: City = [];

export function createCity(size: number) {
  function initialize() {
    for (let x = 0; x < size; x++) {
      const col: CityTile[] = [];

      for (let y = 0; y < size; y++) {
        col.push({
          x,
          y,
          terrain: new Grass(),
          building: undefined,
        });
      }

      data.push(col);
    }
  }

  function update() {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const tile = data[i][j];

        if (tile.building && isGrowable(tile.building) && Math.random() < 0.1) {
          tile.building.grow();
        }
      }
    }

    return data;
  }

  initialize();

  return {
    size,
    data,
    update,
  };
}
