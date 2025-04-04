import { Compressor, Size } from '@statoscope/stats-extension-compressed/dist/generator';
import { NormalizedModule } from '../types';
import { moduleResource, nodeModule } from './module';

export type NodeLink = {
  page: string;
  id: string;
  package?: {
    name: string;
    instance: {
      path: string;
    };
  };
  params?: Record<string, unknown>;
};

export type NodeData = {
  label: string;
  link?: string | NodeLink;
};

export type Node = {
  label: string;
  weight: number;
  weightCompressor?: Compressor;
  groups: Node[];
  link?: string | NodeLink;
  path: string;
};

function makeNode(data: NodeData, size: Size, path: string): Node {
  return {
    label: data.label,
    weight: size.size,
    weightCompressor: size.compressor,
    groups: [],
    link: data.link,
    path,
  };
}

function handleModule(
  root: Node,
  module: NormalizedModule,
  getModuleSize: GetModuleSizeFN,
): void {
  const resource = moduleResource(module);

  if (!resource) {
    return;
  }

  const partsLabels = resource.split(/[/\\]/);
  const parts: NodeData[] = partsLabels.map((label) => ({ label }));
  let currentPackage = null;

  for (const [i, part] of parts.entries()) {
    if (part.label === 'node_modules') {
      currentPackage = { name: '' };
    } else if (currentPackage) {
      if (part.label[0] === '@') {
        currentPackage = { name: part.label };
      } else {
        currentPackage.name += (currentPackage.name ? '/' : '') + part.label;
        const instance = nodeModule(moduleResource(module));
        part.link = {
          page: 'package',
          id: currentPackage.name,
          package: instance
            ? {
                name: instance?.name,
                instance: {
                  path: instance?.path,
                },
              }
            : undefined,
          params: {
            instance: partsLabels.slice(0, i + 1).join('/'),
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
      id: String(module.id || module.identifier),
    };
  }

  apply(
    root,
    parts,
    module.modules && module.modules.length ? { size: 0 } : getModuleSize(module),
  );
}

function apply(root: Node, parts: NodeData[], size: Size): void {
  const stack: Node[] = [root];
  let cursor: Node | null = root;

  function applyToStack(stack: Node[], size: Size): void {
    for (const item of stack) {
      if (!item.weightCompressor) {
        item.weightCompressor = size.compressor;
      } else if (item.weightCompressor !== size.compressor) {
        item.weightCompressor = 'multiple compressors';
      }
      item.weight += size.size;
    }
  }

  for (const part of parts) {
    let node: Node | null =
      cursor?.groups.find((node) => node.label === part.label) || null;

    if (!node) {
      node = makeNode(
        part,
        { size: 0 },
        [...stack, part]
          .map((item) => item.label)
          .filter(Boolean)
          .join('/'),
      );
      cursor.groups.push(node);
    }

    cursor = node;
    stack.push(cursor);
  }

  applyToStack(stack, size);
}

export type GetModuleSizeFN = (module: NormalizedModule) => Size;
export default function modulesToFoamTree(
  modules: NormalizedModule[],
  getModuleSize: GetModuleSizeFN,
): Node {
  const root = makeNode({ label: '' }, { size: 0 }, '/');

  for (const module of modules) {
    handleModule(root, module, getModuleSize);
  }

  return root;
}
