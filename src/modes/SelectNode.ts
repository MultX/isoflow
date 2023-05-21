import { ModeBase } from "./ModeBase";
import { Select } from "../modes/Select";
import { Mouse, ModeContext } from "./types";
import { Node } from "../renderer/elements/Node";

export class SelectNode extends ModeBase {
  node?: Node;

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

  MOUSE_MOVE(mouse: Mouse) {
    if (!this.node) return;

    const tile = this.ctx.renderer.getTileFromMouse(
      mouse.position.x,
      mouse.position.y
    );

    this.node.moveTo(tile.x, tile.y);
    this.cursor.displayAt(tile.x, tile.y);
  }

  MOUSE_UP() {
    this.ctx.activateMode(Select);
  }

  get cursor() {
    return this.ctx.renderer.sceneElements.cursor;
  }
}
