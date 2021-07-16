import Node from './node';

export { Node };

export type PathSolution<TData> = {
  node: Node<TData>;
  children: PathSolution<TData>[];
  parents: PathSolution<TData>[];
};

export default class Graph<TData> {
  nodes = new Map<string, Node<TData>>();

  makeNode(id: string, data: TData): Node<TData> {
    if (this.nodes.has(id)) {
      throw new Error(`Node ${id} already exists`);
    }
    const node = new Node(this, id, data);
    this.nodes.set(node.id, node);
    return node;
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getNode(id: string): Node<TData> | null {
    return this.nodes.get(id) ?? null;
  }

  addChild(child: Node<TData>, to: Node<TData>): void {
    to.children.add(child);
    child.parents.add(to);
  }

  findPaths(from: Node<TData>, to: Node<TData>, max = Infinity): PathSolution<TData> {
    const rootSolution: PathSolution<TData> = {
      node: to,
      children: [],
      parents: [],
    };
    const solutionDepsCache = new Map<PathSolution<TData>, Set<PathSolution<TData>>>([
      [rootSolution, new Set()],
    ]);
    const solutions = new Map<Node<TData>, PathSolution<TData>>([[to, rootSolution]]);
    let total = 0;

    walk(from, to);

    return rootSolution;

    function walk(module: Node<TData>, entry: Node<TData>): PathSolution<TData> | null {
      if (solutions.has(module)) {
        return solutions.get(module)!;
      }

      const solution: PathSolution<TData> = {
        node: module,
        parents: [],
        children: [],
      };

      solutionDepsCache.set(solution, new Set());
      solutions.set(module, solution);

      if (module === entry) {
        total++;
        return solution;
      }

      let find = false;

      for (const parent of module.parents) {
        const parentSolution = walk(parent, entry);

        if (parentSolution) {
          find = true;
          solution.parents.push(parentSolution);

          const parentSolutionDeps = solutionDepsCache.get(parentSolution)!;

          if (!parentSolutionDeps.has(solution)) {
            parentSolution.children.push(solution);
            parentSolutionDeps.add(solution);
          }

          if (total === max) {
            break;
          }
        }
      }

      return find ? solution : null;
    }
  }
}
