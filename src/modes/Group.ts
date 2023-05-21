import { ModeBase } from "./ModeBase";
import { Mouse } from "./types";
import { Select } from "./Select";
import { CURSOR_TYPES } from "../renderer/elements/Cursor";
import { Coords } from "../renderer/types";

export class Group extends ModeBase {
  downTile?: Coords;

  entry(mouse: Mouse) {
    const tile = this.ctx.renderer.getTileFromMouse(
      mouse.position.x,
      mouse.position.y
    );

    this.cursor.displayAt(tile.x, tile.y);
    this.cursor.enable();
  }

  exit() {
    this.cursor.disable();
  }

  MOUSE_ENTER() {
    this.cursor.enable();
  }

  MOUSE_LEAVE() {
    this.cursor.disable();
  }

  MOUSE_MOVE(mouse: Mouse) {
    const { renderer } = this.ctx;
    const { x, y } = renderer.getTileFromMouse(
      mouse.position.x,
      mouse.position.y
    );

    if (this.downTile === undefined) return;
    if (this.downTile.x === x && this.downTile.y === y) return;

    this.cursor.setCursorType(CURSOR_TYPES.LASSO);
    this.cursor.createSelection(this.downTile, { x, y });
  }

  MOUSE_UP(mouse: Mouse) {
    const { renderer } = this.ctx;
    const { x, y } = renderer.getTileFromMouse(
      mouse.position.x,
      mouse.position.y
    );
    const items = renderer.getItemsByTile(x, y);

    if (items.length) {
    } else {
      this.ctx.activateMode(Select);
    }
  }
}
