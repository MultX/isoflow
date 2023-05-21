import { makeAutoObservable } from "mobx";
import Paper, { Group } from "paper";
import gsap from "gsap";
import autobind from "auto-bind";
import { Grid } from "./elements/Grid";
import { CURSOR_TYPES, Cursor } from "./elements/Cursor";
import { TILE_SIZE } from "./constants";
import { clamp } from "../utils";
import { Nodes } from "./elements/Nodes";
import { Positioner } from "./elements/Positioner";
import { SceneI, IconI } from "../validation/SceneSchema";
import { OnSceneChange, Coords } from "./types";
import { createSceneEvent, SceneEvent } from "./SceneEvent";
import { Point } from "paper/dist/paper-core";
import { applyProjectionMatrix } from "./utils/projection";

export interface RendererConfig {
  grid: {
    width: number;
    height: number;
  };
  icons: IconI[];
}

export class Renderer {
  activeLayer: paper.Layer;
  zoom = 1;

  config: RendererConfig = {
    grid: {
      width: 10,
      height: 10,
    },
    icons: [],
  };
  createSceneEvent: ReturnType<typeof createSceneEvent>;
  callbacks: {
    onSceneChange: OnSceneChange;
  };
  ui: {
    container: paper.Group;
    elements: paper.Group;
  };
  sceneElements: {
    grid: Grid;
    cursor: Cursor;
    nodes: Nodes;
  };
  domElements: {
    container: HTMLDivElement;
    canvas: HTMLCanvasElement;
  };
  zoomedScrollPosition = {
    x: 0,
    y: 0,
  };
  rafRef?: number;
  translatedCenter: paper.Point;
  matrix: paper.Matrix;

  constructor(
    containerEl: HTMLDivElement,
    onChange: OnSceneChange,
    config: RendererConfig | undefined
  ) {
    makeAutoObservable(this);
    autobind(this);

    this.config = config ?? this.config;
    this.createSceneEvent = createSceneEvent(this.onSceneChange);

    this.callbacks = {
      onSceneChange: onChange,
    };

    Paper.settings = {
      insertelements: false,
      applyMatrix: false,
    };

    this.domElements = {
      container: containerEl,
      ...this.initDOM(containerEl),
    };

    Paper.setup(this.domElements.canvas);

    this.sceneElements = {
      grid: new Grid(this),
      cursor: new Cursor(this),
      nodes: new Nodes(this),
    };

    this.ui = {
      container: new Group(),
      elements: new Group(),
    };

    this.ui.elements.addChild(this.sceneElements.grid.container);

    this.sceneElements.cursor.setCursorType(CURSOR_TYPES.TILE);
    this.ui.elements.addChild(this.sceneElements.cursor.container);
    this.ui.elements.addChild(this.sceneElements.nodes.container);

    this.ui.container.addChild(this.ui.elements);
    this.ui.container.set({ position: [0, 0] });

    this.activeLayer = Paper.project.activeLayer;
    this.activeLayer.addChild(this.ui.container);
    this.activeLayer.addChild(new Positioner().container);

    this.translatedCenter = Paper.view.center;
    Paper.view.translate(this.translatedCenter);
    this.ui.container.position = new Point(0, 0);
    this.matrix = applyProjectionMatrix(this.ui.container);

    this.render();

    this.init();
  }

  init() {}

  loadScene(scene: SceneI) {
    const sceneEvent = this.createSceneEvent({
      type: "SCENE_LOAD",
    });

    this.config.icons = scene.icons;

    scene.nodes.forEach((node) => {
      this.sceneElements.nodes.addNode(node, sceneEvent);
    });

    sceneEvent.complete();
  }

  getIconById(id: string) {
    const icon = this.config.icons.find((icon) => icon.id === id);

    if (!icon) {
      throw new Error(`Icon not found: ${id}`);
    }

    return icon;
  }

  initDOM(containerEl: HTMLDivElement) {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.setAttribute("resize", "true");
    containerEl.appendChild(canvas);

    return { canvas };
  }

  getTileFromMouse(_mouseX: number, _mouseY: number) {
    const mouse = this.matrix.inverseTransform(new Point(_mouseX, _mouseY));
    const translatedCenter = this.matrix.inverseTransform(
      this.translatedCenter
    );
    const translatedZoomedScrollPosition = this.matrix.inverseTransform(
      this.zoomedScrollPosition
    );

    const zoom = 1 / this.zoom;
    const zoomedTileSize = TILE_SIZE / zoom;

    const mouseX =
      mouse.x - translatedCenter.x - translatedZoomedScrollPosition.x / zoom;
    const mouseY =
      mouse.y - translatedCenter.y - translatedZoomedScrollPosition.y / zoom;

    const row = Math.floor((mouseX + zoomedTileSize / 2) / zoomedTileSize);
    const col = Math.floor((mouseY + zoomedTileSize / 2) / zoomedTileSize);

    const halfRowNum = Math.floor(this.config.grid.width * 0.5);
    const halfColNum = Math.floor(this.config.grid.height * 0.5);

    const res = {
      x: clamp(row, -halfRowNum, halfRowNum),
      y: clamp(col, -halfColNum, halfColNum),
    };

    return res;
  }

  setGrid(width: number, height: number) {}

  setZoom(zoom: number) {
    this.zoom = zoom;

    gsap.killTweensOf(Paper.view);
    gsap.to(Paper.view, {
      duration: 0.3,
      zoom: this.zoom,
    });
  }

  scrollTo(x: number, y: number) {
    this.zoomedScrollPosition = { x, y };

    const { x: centerX, y: centerY } = Paper.view.bounds.center;
    this.ui.elements.position = this.matrix.inverseTransform(
      new Point(x + centerX, y + centerY)
    );
  }

  scrollToDelta(deltaX: number, deltaY: number) {
    this.scrollTo(
      this.zoomedScrollPosition.x + deltaX * (1 / this.zoom),
      this.zoomedScrollPosition.y + deltaY * (1 / this.zoom)
    );
  }

  clear() {
    this.sceneElements.nodes.clear();
  }

  destroy() {
    this.domElements.canvas.remove();

    if (this.rafRef !== undefined) global.cancelAnimationFrame(this.rafRef);
  }

  render() {
    if (Paper.view) {
      if (global.requestAnimationFrame) {
        this.rafRef = global.requestAnimationFrame(this.render.bind(this));
      }

      Paper.view.update();
    }
  }

  exportScene() {
    const exported = {
      icons: this.config.icons,
      nodes: this.sceneElements.nodes.export(),
      groups: [],
      connectors: [],
    };

    return exported;
  }

  onSceneChange(sceneEvent: SceneEvent) {
    this.callbacks.onSceneChange(sceneEvent.event, this.exportScene());
  }

  getNodeByTile(coords: Coords) {
    return this.nodes.getNodeByTile(coords.x, coords.y);
  }

  getNodesInBox(from: Coords, to: Coords) {
    return this.nodes.getNodeByTileBounds(from, to);
  }

  get nodes() {
    return this.sceneElements.nodes;
  }
}
