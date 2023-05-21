import paper from "paper";
import { ModeBase } from "./ModeBase";
import { Mouse } from "./types";
import { Select } from "./Select";
import { CURSOR_TYPES } from "../renderer/elements/Cursor";
import { Coords } from "../renderer/types";

export class Group extends ModeBase {
  startTile?: Coords;
  endTile?: Coords;

  entry(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);

    this.cursor.displayAt(tile.x, tile.y);
    this.cursor.enable();
  }

  exit() {
    this.cursor.disable();
  }

  MOUSE_MOVE(mouse: Mouse) {
    if (this.startTile === undefined) return;
    if (this.endTile !== undefined) return;

    const tile = this.getTileFromMouse(mouse);

    if (this.startTile.x === tile.x && this.startTile.y === tile.y) return;

    this.cursor.setCursorType(CURSOR_TYPES.LASSO);
    this.cursor.createSelection(this.startTile, tile);
  }

  MOUSE_UP(mouse: Mouse) {
    if (this.startTile === undefined) return;

    const endTile = this.getTileFromMouse(mouse);

    if (this.endTile) {
      const groupBounds = new paper.Rectangle(this.startTile, this.endTile);

      if (groupBounds.contains(endTile)) {
      } else {
        this.ctx.activateMode(Select);
      }
    } else {
      this.endTile = endTile;
      const nodes = this.renderer.getNodesInBox(this.startTile, this.endTile);

      console.log(nodes);

      if (nodes.length) {
      } else {
        this.ctx.activateMode(Select);
      }
    }
  }
}
