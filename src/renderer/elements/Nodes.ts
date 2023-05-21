import { Group, Rectangle } from "paper";
import gsap from "gsap";
import autobind from "auto-bind";
import { makeAutoObservable } from "mobx";
import { Context, Coords } from "../types";
import { Node, NodeOptions } from "./Node";
import cuid from "cuid";
import { SceneElement } from "../SceneElement";
import { SceneEvent } from "../SceneEvent";
import { tweenPosition } from "../../utils";
import {
  getTileBounds,
  getTilePosition,
  getBoundingBox,
} from "../utils/gridHelpers";

export class Nodes {
  ctx: Context;
  container = new Group();
  nodes: Node[] = [];

  constructor(ctx: Context) {
    makeAutoObservable(this);
    autobind(this);

    this.ctx = ctx;
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

    this.nodes.push(node);
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
    return this.nodes.find((node) => node.id === id);
  }

  getNodeByTile(x: number, y: number) {
    return this.nodes.find(
      (node) => node.position.x === x && node.position.y === y
    );
  }

  getNodeByTileBounds(start: Coords, end: Coords) {
    console.log(start, end);
    const bounds = {
      from: getTilePosition(start.x, start.y),
      to: getTilePosition(end.x, end.y),
    };

    return this.nodes.filter((node) => {
      if (!node.container.visible) return false;

      const nodeBounds = node.container.bounds;
      const res = new Rectangle(bounds).intersects(nodeBounds);
      console.log(res, nodeBounds, bounds);
      return res;
    });
  }

  clear() {
    this.nodes.forEach((node) => node.destroy());
    this.nodes = [];
  }

  export() {
    const exported = this.nodes.map((node) => node.export());
    return exported;
  }
}
