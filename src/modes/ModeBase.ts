import { ModeContext, Mouse } from "./types";

export class ModeBase {
  ctx;

  constructor(ctx: ModeContext) {
    this.ctx = ctx;
  }

  entry(mouse: Mouse) {}

  exit() {}

  getTileFromMouse(mouse: Mouse) {
    return this.renderer.getTileFromMouse(mouse.position.x, mouse.position.y);
  }

  get cursor() {
    return this.ctx.renderer.sceneElements.cursor;
  }

  get renderer() {
    return this.ctx.renderer;
  }
}
