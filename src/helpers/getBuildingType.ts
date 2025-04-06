import { BaseBuilding } from "../models/BaseBuilding";
import { Road } from "../models/Road";
import { ModelKeys } from "../types/Building";

export function getBuildingType(building: Road | BaseBuilding): ModelKeys {
  if (building instanceof BaseBuilding && building.isUnderConstruction) {
    return `under-construction`;
  }

  if (building instanceof Road) {
    return `${building.type}-${building.style}` as const;
  }

  // @ts-expect-error
  return `${building.type}-${building.style}${building.height}` as const;
}
