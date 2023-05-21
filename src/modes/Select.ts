import { ModeBase } from "./ModeBase";
import { Mouse } from "./types";
import { getNodeFromSelection } from "./utils";
import { SelectNode } from "./SelectNode";
import { Group } from "./Group";
import { Node } from "../renderer/elements/Node";
import { CURSOR_TYPES } from "../renderer/elements/Cursor";
import { Coords } from "../renderer/types";

export class Select extends ModeBase {
  private _downTile?: Coords;

  entry(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);

    this.displayCursorAt(tile);
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

  MOUSE_DOWN(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);
    const node = this.renderer.getNodeByTile(tile);

    if (node instanceof Node) {
      this.ctx.activateMode(SelectNode, (instance) => (instance.node = node));
    } else {
      this._downTile = tile;
    }
  }

  MOUSE_MOVE(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);
    const node = this.renderer.getNodeByTile(tile);

    if (this._downTile) {
      this.ctx.activateMode(Group, (instance) =>
        instance.setStartTile(this._downTile)
      );
    } else {
      this.displayCursorAt(tile);
    }
  }

  MOUSE_UP(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);
    const node = this.renderer.getNodeByTile(tile);
    this._downTile = undefined;

    if (node) {
    } else {
      this.cursor.displayAt(tile.x, tile.y, { skipAnimation: true });
    }
  }

  private displayCursorAt(tile: Coords) {
    this.cursor.displayAt(tile.x, tile.y);
    this.cursor.setCursorType(
      this.renderer.getNodeByTile(tile)
        ? CURSOR_TYPES.OUTLINE
        : CURSOR_TYPES.TILE
    );
  }
}
