import { Shape, Point } from "paper";
import { gsap } from "gsap";
import { applyProjectionMatrix } from "../utils/projection";
import { TILE_SIZE, PIXEL_UNIT } from "../constants";
import {
  sortByPosition,
  getBoundingBox,
  getTileBounds,
} from "../utils/gridHelpers";
import type { Context, Coords } from "../types";
import { SceneElement } from "../SceneElement";
import { tweenPosition } from "../../utils";

export enum CURSOR_TYPES {
  OUTLINE = "OUTLINE",
  CIRCLE = "CIRCLE",
  TILE = "TITLE",
  LASSO = "LASSO",
  DOT = "DOT",
}

export class Cursor extends SceneElement {
  renderElements = {
    rectangle: new Shape.Rectangle([0, 0]),
  };

  animations: {
    highlight: gsap.core.Tween;
  };

  size = {
    width: 1,
    height: 1,
  };

  currentType?: CURSOR_TYPES;

  constructor(ctx: Context) {
    super(ctx);
    this.displayAt = this.displayAt.bind(this);

    this.renderElements.rectangle = new Shape.Rectangle({});

    this.animations = {
      highlight: gsap
        .fromTo(
          this.renderElements.rectangle,
          { duration: 0.25, dashOffset: 1 },
          { dashOffset: PIXEL_UNIT * 12, ease: "none" }
        )
        .repeat(-1),
    };

    this.container.addChild(this.renderElements.rectangle);

    this.container.set({ pivot: [0, 0] });
    this.size = { width: 1, height: 1 };

    this.enable();
  }

  setCursorType(type: CURSOR_TYPES) {
    if (type === this.currentType) return;

    this.currentType = type;

    switch (type) {
      case CURSOR_TYPES.OUTLINE:
        this.renderElements.rectangle.set({
          strokeCap: "round",
          fillColor: null,
          size: [TILE_SIZE * 1.8, TILE_SIZE * 1.8],
          opacity: 1,
          radius: PIXEL_UNIT * 25,
          strokeWidth: PIXEL_UNIT * 3,
          strokeColor: "blue",
          pivot: [0, 0],
          dashArray: [PIXEL_UNIT * 6, PIXEL_UNIT * 6],
        });
        this.animations.highlight.play();
        break;
      case CURSOR_TYPES.LASSO:
        this.renderElements.rectangle.set({
          strokeCap: "round",
          fillColor: "lightBlue",
          size: [TILE_SIZE, TILE_SIZE],
          opacity: 0.5,
          radius: PIXEL_UNIT * 8,
          strokeWidth: PIXEL_UNIT * 3,
          strokeColor: "blue",
          dashArray: [PIXEL_UNIT * 6, PIXEL_UNIT * 6],
          pivot: [0, 0],
        });
        this.animations.highlight.play();
        break;
      case CURSOR_TYPES.DOT:
        this.renderElements.rectangle.set({
          strokeCap: null,
          fillColor: "blue",
          size: [TILE_SIZE * 0.2, TILE_SIZE * 0.2],
          opacity: 1,
          radius: PIXEL_UNIT * 8,
          strokeWidth: null,
          strokeColor: null,
          dashArray: null,
          pivot: [0, 0],
        });
        break;
      case CURSOR_TYPES.TILE:
      default:
        this.renderElements.rectangle.set({
          strokeCap: "round",
          fillColor: "blue",
          size: [TILE_SIZE, TILE_SIZE],
          opacity: 0.5,
          radius: PIXEL_UNIT * 8,
          strokeWidth: 0,
          strokeColor: "transparent",
          pivot: [0, 0],
          dashArray: null,
        });
    }
  }

  enable() {
    this.container.visible = true;
  }

  disable() {
    this.container.visible = false;
  }

  createSelection(from: Coords, to: Coords) {
    const boundingBox = getBoundingBox([from, to]);
    this.createSelectionFromBounds(boundingBox);
  }

  createSelectionFromBounds(boundingBox: Coords[]) {
    this.setCursorType(CURSOR_TYPES.LASSO);

    const sorted = sortByPosition(boundingBox);

    console.log(sorted);
    this.size = {
      width: sorted.highX - sorted.lowX,
      height: sorted.highY - sorted.lowY,
    };

    this.renderElements.rectangle.set({
      size: [
        (this.size.width + 1) * TILE_SIZE - PIXEL_UNIT * 3,
        (this.size.height + 1) * TILE_SIZE - PIXEL_UNIT * 3,
      ],
    });

    const beginTileBounds = getTileBounds(sorted.lowX, sorted.lowY);
    const targetTileBounds = getTileBounds(sorted.highX, sorted.highY);

    console.log(beginTileBounds, targetTileBounds);

    const centerBetweenTiles = new Point({
      x: (beginTileBounds.center.x + targetTileBounds.center.x) / 2,
      y: (beginTileBounds.center.y + targetTileBounds.center.y) / 2,
    });

    console.log(centerBetweenTiles);

    this.container.position = centerBetweenTiles;
  }

  predictBoundsAt(tile: Coords) {
    const bounds = [
      { x: tile.x, y: tile.y },
      { x: tile.x, y: tile.y - this.size.height },
      { x: tile.x + this.size.width, y: tile.y - this.size.height },
      { x: tile.x + this.size.width, y: tile.y },
    ];

    return bounds;
  }

  getInfo() {
    return { ...this.container.position, ...this.size };
  }

  displayAt(x: number, y: number, opts?: { skipAnimation: boolean }) {
    if (x === this.position.x && y === this.position.y) return;

    const tile = getTileBounds(x, y)["center"];

    tweenPosition(this.container, {
      ...tile,
      duration: opts?.skipAnimation ? 0 : 0.05,
    });
  }

  get position() {
    return this.container.position;
  }
}
