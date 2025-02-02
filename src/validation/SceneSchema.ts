import { z } from "zod";

export const IconSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  category: z.string().optional(),
});

export const NodeSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  icon: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const ConnectorSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  from: z.string(),
  to: z.string(),
});

export const GroupSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  nodes: z.array(z.string()),
});

export type IconI = z.infer<typeof IconSchema>;
export type NodeI = z.infer<typeof NodeSchema>;
export type ConnectorI = z.infer<typeof ConnectorSchema>;
export type GroupI = z.infer<typeof GroupSchema>;

export const findInvalidNode = (nodes: NodeI[], icons: IconI[]) => {
  return nodes.find((node) => {
    const validIcon = icons.find((icon) => node.icon === icon.id);
    return !Boolean(validIcon);
  });
};

export const findInvalidConnector = (
  connectors: ConnectorI[],
  nodes: NodeI[]
) => {
  return connectors.find((con) => {
    const fromNode = nodes.find((node) => con.from === node.id);
    const toNode = nodes.find((node) => con.to === node.id);

    return Boolean(!fromNode || !toNode);
  });
};

export const findInvalidGroup = (groups: GroupI[], nodes: NodeI[]) => {
  return groups.find((grp) => {
    return grp.nodes.find((grpNodeId) => {
      const validNode = nodes.find((node) => node.id === grpNodeId);
      return Boolean(!validNode);
    });
  });
};

export const SceneSchema = z
  .object({
    icons: z.array(IconSchema),
    nodes: z.array(NodeSchema),
    connectors: z.array(ConnectorSchema),
    groups: z.array(GroupSchema),
  })
  .superRefine((scene, ctx) => {
    const invalidNode = findInvalidNode(scene.nodes, scene.icons);

    if (invalidNode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nodes", invalidNode.id],
        message: "Invalid node found in scene",
      });

      return;
    }

    const invalidConnector = findInvalidConnector(
      scene.connectors,
      scene.nodes
    );

    if (invalidConnector) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["connectors", invalidConnector.id],
        message: "Invalid connector found in scene",
      });

      return;
    }

    const invalidGroup = findInvalidGroup(scene.groups, scene.nodes);

    if (invalidGroup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["groups", invalidGroup.id],
        message: "Invalid group found in scene",
      });
    }
  });

export type SceneI = z.infer<typeof SceneSchema>;
