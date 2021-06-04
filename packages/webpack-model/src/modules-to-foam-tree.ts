import { moduleResource } from './module';
import { NormalizedModule } from './normalize';

export type NodeLink = { page: string; id: string; params?: Record<string, unknown> };

export type NodeData = {
  label: string;
  link?: string | NodeLink;
};

export type Node = {
  label: string;
  weight: number;
  groups: Node[];
  link?: string | NodeLink;
  path: string;
};

function makeNode(data: NodeData, size: number, path: string): Node {
  return {
    label: data.label,
    weight: size,
    groups: [],
    link: data.link,
    path,
  };
}

function handleModule(root: Node, module: NormalizedModule): void {
  const resource = moduleResource(module);

  if (!resource) {
    return;
  }

  const parts: NodeData[] = resource.split(/[/\\]/).map((label) => ({ label }));
  let currentPackage = null;

  for (const [i, part] of parts.entries()) {
    if (part.label === 'node_modules') {
      currentPackage = { name: '' };
    } else if (currentPackage) {
      if (part.label[0] === '@') {
        currentPackage = { name: part.label };
      } else {
        currentPackage.name += (currentPackage.name ? '/' : '') + part.label;
        part.link = {
          page: 'package',
          id: currentPackage.name,
          params: {
            instance: parts
              .map((part) => part.label)
              .slice(0, i + 1)
              .join('/'),
          },
        };
        currentPackage = null;
      }
    }
  }

  if (parts.length) {
    const last = parts[parts.length - 1];
    last.link = {
      page: 'module',
      id: module.id || module.name,
    };
  }

  apply(root, parts, module.modules ? 0 : module.size);
}

function apply(root: Node, parts: NodeData[], size: number): void {
  const stack: Node[] = [root];
  let cursor: Node | null = root;

  function applyToStack(stack: Node[], size: number): void {
    for (const item of stack) {
      item.weight += size;
    }
  }

  for (const part of parts) {
    let node: Node | null =
      cursor?.groups.find((node) => node.label === part.label) || null;

    if (!node) {
      node = makeNode(
        part,
        0,
        [...stack, part]
          .map((item) => item.label)
          .filter(Boolean)
          .join('/')
      );
      cursor.groups.push(node);
    }

    cursor = node;
    stack.push(cursor);
  }

  applyToStack(stack, size);
}

export default function modulesToFoamTree(modules: NormalizedModule[]): Node {
  const root = makeNode({ label: '' }, 0, '/');

  for (const module of modules) {
    handleModule(root, module);

    if (module.modules) {
      for (const innerModule of module.modules) {
        handleModule(root, innerModule);
      }
    }
  }

  return root;
}
