import archy, { Data } from 'archy';

export type Node = Data;

export default function makeTree(node: Data, prefix?: string): string {
  return archy(node, prefix);
}
