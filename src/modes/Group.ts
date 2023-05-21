import paper from "paper";
import { ModeBase } from "./ModeBase";
import { Mouse } from "./types";
import { Select } from "./Select";
import { CURSOR_TYPES } from "../renderer/elements/Cursor";
import { Coords } from "../renderer/types";
import { Node } from "../renderer/elements/Node";

export class Group extends ModeBase {
  private _startTile?: Coords;
  private _endTile?: Coords;
  private _selectedNodes: Node[] = [];

  entry(mouse: Mouse) {
    const tile = this.getTileFromMouse(mouse);

    this.cursor.displayAt(tile.x, tile.y);
    this.cursor.enable();
  }

  exit() {
    this.cursor.disable();
  }

  setStartTile(tile: Coords | undefined) {
    this._startTile = tile;
  }

  MOUSE_MOVE(mouse: Mouse) {
    if (this._startTile === undefined) return;
    if (this._endTile !== undefined) return;

    const tile = this.getTileFromMouse(mouse);

    if (this._startTile.x === tile.x && this._startTile.y === tile.y) return;

    this.cursor.setCursorType(CURSOR_TYPES.LASSO);
    this.cursor.createSelection(this._startTile, tile);

    this._selectedNodes.forEach((node) => (node.selected = false));
    this._selectedNodes = this.renderer.getNodesInBox({
      from: this._startTile,
      to: tile,
    });
    this._selectedNodes.forEach((node) => (node.selected = true));
  }

  MOUSE_UP(mouse: Mouse) {
    if (this._startTile === undefined) return;

    const endTile = this.getTileFromMouse(mouse);

    if (this._endTile) {
      const groupBounds = new paper.Rectangle(this._startTile, this._endTile);

      if (groupBounds.contains(endTile)) {
      } else {
        this._selectedNodes.forEach((node) => (node.selected = false));
        this.ctx.activateMode(Select);
      }
    } else {
      this._endTile = endTile;
      const nodes = this.renderer.getNodesInBox({
        from: this._startTile,
        to: this._endTile,
      });

      console.log(nodes);

      if (nodes.length) {
      } else {
        this.ctx.activateMode(Select);
      }
    }
  }
}
