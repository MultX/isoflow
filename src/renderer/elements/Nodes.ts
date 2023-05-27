import autobind from "auto-bind";
import { Context, Coords, CoordsBox } from "../types";
import { Node, NodeOptions } from "./Node";
import cuid from "cuid";
import { SceneElement } from "../SceneElement";
import { SceneEvent } from "../SceneEvent";
import { tweenPosition } from "../../utils";
import { getTileBounds, isWithin } from "../utils/gridHelpers";

export class Nodes extends SceneElement {
  private _nodes: Node[] = [];

  constructor(ctx: Context) {
    super(ctx);

    autobind(this);
  }

  addNode(options: NodeOptions, sceneEvent?: SceneEvent) {
    const node = new Node(
      this.ctx,
      {
        ...options,
        id: options.id ?? cuid(),
      },
      {
        onMove: this.onMove.bind(this),
      }
    );

    this._nodes.push(node);
    this.container.addChild(node.container);

    this.ctx
      .createSceneEvent(
        {
          type: "NODE_CREATED",
          node,
        },
        sceneEvent
      )
      .complete();
  }

  onMove(x: number, y: number, node: Node, opts?: { skipAnimation: boolean }) {
    const tile = getTileBounds(x, y);

    node.position = {
      x,
      y,
    };

    tweenPosition(node.container, {
      ...tile.center,
      duration: opts?.skipAnimation ? 0 : 0.05,
    });
  }

  getNodeById(id: string) {
    return this._nodes.find((node) => node.id === id);
  }

  getNodeByTile(tile: Coords): Node | undefined {
    return this._nodes.find(
      (node) => node.position.x === tile.x && node.position.y === tile.y
    );
  }

  getNodesInBox(box: CoordsBox): Node[] {
    return this._nodes.filter(
      (node) => node.container.visible && isWithin(node.position, box)
    );
  }

  clear() {
    this._nodes.forEach((node) => node.destroy());
    this._nodes = [];

    super.clear();
  }

  export() {
    return this._nodes.map((node) => node.export());
  }
}
