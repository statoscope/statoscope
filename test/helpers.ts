// eslint-disable-next-line @typescript-eslint/ban-types
import { PathSolution } from '../packages/helpers/dist/graph';
import { ModuleGraphNodeData } from '../packages/webpack-model/src/normalize';

export function serializeSolutionPath<TType>(
  solution: PathSolution<TType>
  // eslint-disable-next-line @typescript-eslint/ban-types
): object {
  return {
    node: {
      id: solution.node.id,
    },
    children: solution.children.map(serializeSolutionPath),
  };
}
