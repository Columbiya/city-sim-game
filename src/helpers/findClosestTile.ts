import { CityTile } from "../types/City";
import { WorkerPayload } from "../WorkerClient";

type Payload = Omit<WorkerPayload, "type" | "citizenId"> & {
  searchCriteria: (tile: CityTile) => boolean;
};

export function findClosestTile(data: Payload): CityTile | null {
  const { startx, starty, maxDistance, city, searchCriteria } = data;

  const visited = new Set();
  let queue: [number, number][] = [[startx, starty]];
  let currentDistance = 0;

  while (queue.length) {
    const current: [number, number][] = [];

    if (currentDistance > maxDistance) return null;

    for (const c of queue) {
      const [x, y] = c;

      if (x >= city.length || x < 0 || y >= city[x].length || y < 0) continue;

      const tile = city[x][y];

      if (visited.has(tile.id)) continue;
      if (tile.building && searchCriteria(tile)) {
        return tile;
      }

      visited.add(tile.id);

      current.push([x + 1, y]);
      current.push([x, y + 1]);
      current.push([x - 1, y]);
      current.push([x, y - 1]);
    }

    currentDistance++;
    queue = current;
  }

  return null;
}

export function findClosestTiles(data: Payload) {
  const { startx, starty, maxDistance, city, searchCriteria } = data;

  const visited = new Set();
  let queue: [number, number][] = [[startx, starty]];
  let currentDistance = 0;
  const tiles: CityTile[] = [];

  while (queue.length) {
    const current: [number, number][] = [];

    if (currentDistance > maxDistance) return tiles;

    for (const c of queue) {
      const [x, y] = c;

      if (x >= city.length || x < 0 || y >= city[x].length || y < 0) continue;

      const tile = city[x][y];

      if (visited.has(tile.id)) continue;
      if (tile.building && searchCriteria(tile)) {
        tiles.push(tile);
      }

      visited.add(tile.id);

      current.push([x + 1, y]);
      current.push([x, y + 1]);
      current.push([x - 1, y]);
      current.push([x, y - 1]);
    }

    currentDistance++;
    queue = current;
  }

  return tiles;
}
