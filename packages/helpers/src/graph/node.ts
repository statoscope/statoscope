import type Graph from './';
import type { PathSolution } from './';

export default class Node<TData> {
  readonly id: string;
  graph: Graph<TData>;
  children = new Set<Node<TData>>();
  parents = new Set<Node<TData>>();
  data: TData;

  constructor(graph: Graph<TData>, id: string, data: TData) {
    this.id = id;
    this.data = data;
    this.graph = graph;
  }

  addChild(node: Node<TData>): void {
    this.graph.addChild(node, this);
  }

  findPathsTo(node: Node<TData>, max = Infinity): PathSolution<TData> {
    return this.graph.findPaths(this, node, max);
  }
}
