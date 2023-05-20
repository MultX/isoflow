import { makeAutoObservable } from "mobx";
import { Group, Raster, Shape } from "paper";
import { Coords, Context } from "../types";
import { PIXEL_UNIT, TILE_SIZE } from "../constants";

export interface NodeOptions {
  id: string;
  position: Coords;
  icon: string;
}

interface Callbacks {
  onMove: (x: number, y: number, node: Node) => void;
}

export class Node {
  ctx: Context;
  container = new Group();

  id;
  callbacks: Callbacks;
  transform_scale: number;
  position: Coords;
  icon: string;
  renderElements = {
    iconContainer: new Group(),
    icon: new Raster(),
    rectangle: new Shape.Rectangle({}),
  };

  constructor(ctx: Context, options: NodeOptions, callbacks: Callbacks) {
    makeAutoObservable(this);

    this.ctx = ctx;
    this.id = options.id;
    this.position = options.position;
    this.icon = options.icon;
    this.callbacks = callbacks;

    this.transform_scale = this.ctx.ui.container.matrix
      .inverseTransform([1, 1])
      .getDistance([0, 0]);

    this.renderElements.icon.matrix = this.ctx.ui.container.matrix.inverted();
    this.renderElements.iconContainer.addChild(this.renderElements.icon);

    this.container.addChild(this.renderElements.rectangle);
    this.container.addChild(this.renderElements.iconContainer);

    this.renderElements.rectangle.set({
      strokeCap: "round",
      fillColor: "#AA99DF",
      size: [TILE_SIZE * 1.2, TILE_SIZE * 1.2],
      opacity: 0.7,
      radius: PIXEL_UNIT * 6,
      strokeWidth: PIXEL_UNIT * 1,
      strokeColor: "#7744DF",
    });

    this.init();
  }

  async init() {
    await this.updateIcon(this.icon);
    this.moveTo(this.position.x, this.position.y);
  }

  async updateIcon(icon: string) {
    this.icon = icon;
    const { iconContainer, icon: iconEl } = this.renderElements;

    await new Promise((resolve) => {
      iconEl.onLoad = () => {
        iconEl.scale((TILE_SIZE * this.transform_scale) / iconEl.bounds.width);

        iconContainer.position.set(0, 0);

        resolve(null);
      };

      iconEl.source = this.ctx.getIconById(this.icon).url;
    });
  }

  moveTo(x: number, y: number) {
    this.callbacks.onMove(x, y, this);
  }

  export() {
    return {
      id: this.id,
      position: this.position,
      icon: this.icon,
    };
  }

  clear() {
    this.container.removeChildren();
  }

  destroy() {
    this.container.remove();
  }
}
