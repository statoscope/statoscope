function isValidId(id) {
  const type = typeof id;

  return type === 'string' || type === 'number';
}

function createMessageHandler(data, messageType) {
  return warning => {
    switch (warning.from) {
      case 'module':
        warning.source = data.input.modules.find(m => m.id === warning.source);
        break;
      case 'entrypoint':
        warning.source = data.output.bundles.find(e => e.name === warning.source);
        break;
      case 'chunk':
        warning.source = data.output.chunks.find(c => c.id === warning.source);
        break;
      case 'asset':
        warning.source = data.output.files.find(f => f.path === warning.source);
        break;
    }

    if (warning.source && !warning.source[messageType].includes(warning)) {
      warning.source[messageType].push(warning);
    }
  };
}

export default rawData => {
  if (rawData.data) {
    rawData.data.output.chunks.forEach(chunk => {
      chunk.warnings = [];
      chunk.errors = [];

      if (chunk.entryModule) {
        if (isValidId(chunk.entryModule)) {
          chunk.entryModule = rawData.data.input.modules.find(m => m.id === chunk.entryModule)
        }
      }

      if (chunk.files) {
        chunk.files = chunk.files.map(file => {
          if (isValidId(file)) {
            return rawData.data.output.files.find(i => file === i.path)
          }

          return file;
        });
      }

      if (chunk.modules) {
        chunk.modules = chunk.modules.map(module => {
          if (isValidId(module)) {
            return rawData.data.input.modules.find(m => m.id === module);
          }

          return module;
        });
      }

      if (chunk.groups) {
        chunk.groups = chunk.groups.map(group => {
          if (isValidId(group)) {
            return rawData.data.output.chunkGroups.find(g => g.id === group);
          }

          return group;
        });
      }
    });

    rawData.data.output.chunkGroups.forEach(group => {
      if (group.runtimeChunk) {
        if (isValidId(group.runtimeChunk)) {
          group.runtimeChunk = rawData.data.output.chunks.find(c => c.id === group.runtimeChunk)
        }
      }

      if (group.chunks) {
        group.chunks = group.chunks.map(chunk => {
          if (isValidId(chunk)) {
            return rawData.data.output.chunks.find(c => c.id === chunk);
          }

          return chunk;
        });
      }

      if (group.children) {
        group.children = group.children.map(group => {
          if (isValidId(group)) {
            return rawData.data.output.chunkGroups.find(g => g.id === group);
          }

          return group;
        });
      }

      if (group.parents) {
        group.parents = group.parents.map(group => {
          if (isValidId(group)) {
            return rawData.data.output.chunkGroups.find(g => g.id === group);
          }

          return group;
        });
      }
    });

    rawData.data.output.bundles.forEach(bundle => {
      bundle.warnings = [];
      bundle.errors = [];

      if (bundle.module) {
        if (isValidId(bundle.module)) {
          bundle.module = rawData.data.input.modules.find(m => m.id === bundle.module)
        }
      }

      if (bundle.chunks) {
        bundle.chunks = bundle.chunks.map(chunk => {
          if (isValidId(chunk)) {
            return rawData.data.output.chunks.find(c => c.id === chunk);
          }

          return chunk;
        });
      }
    });

    rawData.data.output.files.forEach(file => {
      file.warnings = [];
      file.errors = [];
      file.chunks = rawData.data.output.chunks.filter(chunk =>
        chunk.files.find(chunkFile =>
          chunkFile.path === file.path));
    });

    rawData.data.input.modules.forEach(module => {
      module.chunks = rawData.data.output.chunks.filter(c => c.modules.includes(module));
      module.warnings = [];
      module.errors = [];

      if (isValidId(module.file)) {
        module.file = rawData.data.input.files.find(i => module.file === i.path)
      }

      if (module.deps) {
        module.deps.map(dep => {
          if (isValidId(dep.module)) {
            dep.module = rawData.data.input.modules.find(m => m.id === dep.module);
          }
        });
      }

      if (module.reasons) {
        module.reasons.map(reason => {
          if (isValidId(reason.module)) {
            reason.module = rawData.data.input.modules.find(m => m.id === reason.module);
          }
        });
      }

      if (module.concatenated) {
        module.concatenated = module.concatenated.map(concatenatedModule => {
          if (isValidId(concatenatedModule)) {
            return rawData.data.input.modules.find(m => m.id === concatenatedModule);
          }

          return concatenatedModule;
        });
      }

      if (module.extracted) {
        if (isValidId(module.extracted)) {
          module.extracted = rawData.data.input.modules.find(m => m.id === module.extracted);
        }
      }
    });

    rawData.data.warnings.forEach(createMessageHandler(rawData.data, 'warnings'));
    rawData.data.errors.forEach(createMessageHandler(rawData.data, 'errors'));
  }

  return rawData;
};
