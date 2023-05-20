import { Group, Path, Point } from "paper";
import type { Context } from "../types";
import { TILE_SIZE, PIXEL_UNIT, SCALING_CONST } from "../constants";
import { SceneElement } from "../SceneElement";

export class Grid extends SceneElement {
  renderElements = {
    grid: new Group({ applyMatrix: false }),
  };

  constructor(ctx: Context) {
    super(ctx);

    this.container.addChild(this.renderElements.grid);

    const width =
      this.ctx.config.grid.width + 1 - (this.ctx.config.grid.width % 2);
    const height =
      this.ctx.config.grid.height + 1 - (this.ctx.config.grid.height % 2);
    const lineLengthW = width * TILE_SIZE;
    const lineLengthH = height * TILE_SIZE;

    const gridSideLines = (
      size: number,
      lineLength: number,
      segments: (start: number) => Array<Array<number>>
    ) => {
      for (let step = 0; step <= size; step++) {
        this.renderElements.grid.addChild(
          new Path({
            segments: segments(step * TILE_SIZE - lineLength * 0.5),
            strokeWidth: PIXEL_UNIT * 1,
            strokeColor: "rgba(0, 0, 0, 0.15)",
          })
        );
      }
    };

    gridSideLines(width, lineLengthH, (start) => [
      [start, -lineLengthH * 0.5],
      [start, lineLengthH * 0.5],
    ]);

    gridSideLines(height, lineLengthW, (start) => [
      [-lineLengthW * 0.5, start],
      [lineLengthW * 0.5, start],
    ]);

    this.renderElements.grid.scaling = new Point(SCALING_CONST, SCALING_CONST);
  }
}
