import { Matrix, Point } from "paper";

export const getProjectionMatrix = (x: number, y: number) => {
  const x_scale = 2;
  const y_scale = 6;

  return new Matrix([
    Math.sqrt(x_scale) / x_scale,
    Math.sqrt(y_scale) / y_scale,
    -(Math.sqrt(x_scale) / x_scale),
    Math.sqrt(y_scale) / y_scale,
    0,
    0,
  ]);
};

export const applyProjectionMatrix = (
  item: paper.Item,
  pivot?: paper.Point,
  rotation?: number
) => {
  const matrix = getProjectionMatrix(0, 0);
  matrix.rotate(rotation ?? 0, new Point(0, 0));
  item.pivot = pivot ?? new Point(0, 0);
  item.matrix = matrix;

  return matrix;
};
