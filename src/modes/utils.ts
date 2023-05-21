import { Node } from "../renderer/elements/Node";

export const getNodeFromSelection = (items: (Node | undefined)[]) => {
  const node = items.find((item) => item instanceof Node);

  if (node) {
    return node;
  }

  return null;
};
