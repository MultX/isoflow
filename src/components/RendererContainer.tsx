import React, { useRef, useEffect, useContext } from "react";
import { observer } from "mobx-react";
import Box from "@mui/material/Box";
import { Renderer, RendererConfig } from "../renderer/Renderer";
import { useGlobalState } from "../hooks/useGlobalState";
import { useMouseInput } from "../hooks/useMouseInput";
import { modeManagerContext } from "../contexts/ModeManagerContext";
import { Select } from "../modes/Select";

export const RendererContainer = observer(() => {
  const modeManager = useContext(modeManagerContext);
  const rendererEl = useRef<HTMLDivElement>(null);
  const { setDomEl, setCallbacks } = useMouseInput();
  const setRenderer = useGlobalState((state) => state.setRenderer);
  const onSceneChange = useGlobalState((state) => state.onSceneChange);

  useEffect(() => {
    if (!rendererEl.current) return;

    const config: RendererConfig = {
      grid: { width: 11, height: 11 },
      icons: [],
    };
    const renderer = new Renderer(rendererEl.current, onSceneChange, config);
    setRenderer(renderer);
    setDomEl(rendererEl.current);
    modeManager.setRenderer(renderer);
    modeManager.activateMode(Select);

    setCallbacks({
      onMouseMove: (event) => {
        modeManager.onMouseEvent("MOUSE_MOVE", event);
      },
      onMouseDown: (event) => {
        modeManager.onMouseEvent("MOUSE_DOWN", event);
      },
      onMouseUp: (event) => {
        modeManager.onMouseEvent("MOUSE_UP", event);
      },
      onMouseEnter: (event) => {
        modeManager.onMouseEvent("MOUSE_ENTER", event);
      },
      onMouseLeave: (event) => {
        modeManager.onMouseEvent("MOUSE_LEAVE", event);
      },
    });
  }, [setRenderer, setDomEl, modeManager, onSceneChange]);

  return (
    <div
      ref={rendererEl}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
});
