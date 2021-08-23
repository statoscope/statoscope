// eslint-disable-next-line @typescript-eslint/ban-types
import { PathSolution } from '../packages/helpers/dist/graph';

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
