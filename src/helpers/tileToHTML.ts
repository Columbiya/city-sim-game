import { CityTile } from "../types/City";

export function tileToHTML(tile: CityTile) {
  return `<div>
      <div><span class="subtitle">Coordinates:</span> {X: ${tile.x}, Y: ${tile.y}}</div>
      <div><span class="subtitle">Terrain:</span> ${tile.terrain.type}</div>
      </div>`;
}
