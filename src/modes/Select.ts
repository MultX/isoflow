import { ModeBase } from "./ModeBase";
import { Mouse } from "./types";
import { getNodeFromSelection } from "./utils";
import { SelectNode } from "./SelectNode";
import { Group } from "./Group";
import { Node } from "../renderer/elements/Node";
import { CURSOR_TYPES } from "../renderer/elements/Cursor";
import { Coords } from "../renderer/types";

export class Select extends ModeBase {
  downTile?: Coords;

  entry(mouse: Mouse) {
    const tile = this.ctx.renderer.getTileFromMouse(
      mouse.position.x,
      mouse.position.y
    );

    this.cursor.displayAt(tile.x, tile.y, { skipAnimation: true });
    this.cursor.setCursorType(CURSOR_TYPES.TILE);
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
    const node = this.renderer.getNodeByTile(mouse.position);

    if (node instanceof Node) {
      this.ctx.activateMode(SelectNode, (instance) => (instance.node = node));
    } else {
      this.downTile = tile;
    }
  }

  MOUSE_MOVE(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);
    const node = this.renderer.getNodeByTile(mouse.position);

    if (this.downTile) {
      this.ctx.activateMode(Group, (instance) => (instance.startTile = tile));
    } else {
      this.cursor.displayAt(tile.x, tile.y);

      if (node instanceof Node) {
        this.cursor.setCursorType(CURSOR_TYPES.OUTLINE);
      } else {
        this.cursor.setCursorType(CURSOR_TYPES.TILE);
      }
    }
  }

  MOUSE_UP(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);
    const node = this.renderer.getNodeByTile(tile);
    this.downTile = undefined;

    if (node) {
    } else {
      this.cursor.setCursorType(CURSOR_TYPES.TILE);
      this.cursor.displayAt(tile.x, tile.y, { skipAnimation: true });
    }
  }
}
