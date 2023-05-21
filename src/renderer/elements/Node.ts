import { Group, Raster, Shape } from "paper";
import { Coords, Context } from "../types";
import { PIXEL_UNIT, TILE_SIZE } from "../constants";
import { CURSOR_TYPES, Cursor } from "./Cursor";
import { SceneElement } from "../SceneElement";

export interface NodeOptions {
  id: string;
  position: Coords;
  icon: string;
}

interface Callbacks {
  onMove: (x: number, y: number, node: Node) => void;
}

type NodeRenderElements = {
  iconContainer: paper.Group;
  icon: paper.Raster;
  bottom: paper.Shape.Rectangle;
  selected: Cursor;
};

export class Node extends SceneElement {
  private _selected: boolean = false;
  private _transform_scale: number;
  private _icon: string;
  private _renderElements: NodeRenderElements;

  id: string;
  callbacks: Callbacks;
  position: Coords;

  get selected() {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;

    if (value) {
      this._renderElements.selected.enable();
    } else {
      this._renderElements.selected.disable();
    }
  }

  constructor(ctx: Context, options: NodeOptions, callbacks: Callbacks) {
    super(ctx);

    this.id = options.id;
    this.position = options.position;
    this._icon = options.icon;
    this.callbacks = callbacks;

    this._transform_scale = this.ctx.ui.container.matrix
      .inverseTransform([1, 1])
      .getDistance([0, 0]);

    this._renderElements = {
      iconContainer: new Group(),
      icon: new Raster(),
      bottom: new Shape.Rectangle({}),
      selected: new Cursor(this.ctx),
    };

    this.setupSubviews();
    this.init();
  }

  async init() {
    await this.updateIcon(this._icon);
    this.moveTo(this.position.x, this.position.y);
  }

  async updateIcon(icon: string) {
    this._icon = icon;
    const { iconContainer, icon: iconEl } = this._renderElements;

    await new Promise((resolve) => {
      iconEl.onLoad = () => {
        iconEl.scale((TILE_SIZE * this._transform_scale) / iconEl.bounds.width);

        iconContainer.position.set(0, 0);

        resolve(null);
      };

      iconEl.source = this.ctx.getIconById(this._icon).url;
    });
  }

  moveTo(x: number, y: number) {
    this.callbacks.onMove(x, y, this);
  }

  export() {
    return {
      id: this.id,
      position: this.position,
      icon: this._icon,
    };
  }

  private setupSubviews() {
    this._renderElements.icon.matrix = this.ctx.ui.container.matrix.inverted();
    this._renderElements.iconContainer.addChild(this._renderElements.icon);

    this.container.addChild(this._renderElements.bottom);

    this.container.addChild(this._renderElements.selected.container);
    this.container.addChild(this._renderElements.iconContainer);

    this._renderElements.bottom.set({
      strokeCap: "round",
      fillColor: "#AA99DF",
      size: [TILE_SIZE * 1.2, TILE_SIZE * 1.2],
      opacity: 0.7,
      radius: PIXEL_UNIT * 6,
      strokeWidth: PIXEL_UNIT * 1,
      strokeColor: "#7744DF",
    });

    this._renderElements.selected.setCursorType(CURSOR_TYPES.OUTLINE);
    this._renderElements.selected.disable();
  }
}
