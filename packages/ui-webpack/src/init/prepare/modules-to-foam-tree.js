import moduleResource from './module';

function makeNode(data, size, path) {
  return {
    label: data.label,
    weight: size,
    groups: [],
    link: data.link,
    path,
  };
}

function handleModule(root, module) {
  const resource = moduleResource(module);

  if (!resource) {
    return;
  }

  const parts = resource.split(/[/\\]/).map((label) => ({ label }));
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
      id: module.id || module.identifier,
    };
  }

  apply(root, parts, module.modules ? 0 : module.size);
}

function apply(root, parts, size) {
  const stack = [root];
  let cursor = root;

  function applyToStack(stack, size) {
    for (const item of stack) {
      item.weight += size;
    }
  }

  for (const part of parts) {
    let node = cursor.groups.find((node) => node.label === part.label);

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

export default function modulesToFoamTree(modules) {
  const root = makeNode('', 0, '/');

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
