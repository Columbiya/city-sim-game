import { isJobProvidable } from "./helpers/isJobProvidable";
import { CityTile } from "./types/City";
import { WorkerPayload } from "./WorkerClient";

self.addEventListener("message", (event) => {
  const finds = event.data as WorkerPayload[];

  if (!Array.isArray(finds)) return;

  const map = new Map<string, [number, number] | null>();

  for (const find of finds) {
    const position = findClosestTile(find);

    map.set(find.citizenId, position);
  }

  self.postMessage(map);
});

function findClosestTile(data: WorkerPayload): [number, number] | null {
  const { type, startx, starty, maxDistance, city } = data;

  let searchCriteria: (tile: CityTile) => boolean =
    type === "findClosestJob"
      ? (tile: CityTile) => {
          if (!tile.building) return false;

          return (
            isJobProvidable(tile.building) &&
            tile.building.maxWorkers - tile.building.workers.size > 0
          );
        }
      : () => true;

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
        return [x, y];
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
