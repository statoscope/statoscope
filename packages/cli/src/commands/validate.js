const fs = require('fs');
const path = require('path');
const { parseChunked } = require('@discoveryjs/json-ext');
const { prepareWithJora } = require('@statoscope/webpack-model');
const { jora: joraHelpers } = require('@statoscope/helpers');

function makeQueryValidator(query) {
  function validate(type, message) {
    if (!(!type || type === 'error' || type === 'warn' || type === 'info')) {
      throw new Error(`Unknown message type [${type}]`);
    }

    if (!message) {
      throw new Error(`Message must be specified`);
    }
  }

  function callAPI(api, { type, filename, message }) {
    validate(type, message);

    if (typeof type === 'undefined' || type === 'error') {
      api.error(message, filename);
    } else if (type === 'warn') {
      api.warn(message, filename);
    } else if (type === 'info') {
      api.warn(message, filename);
    } else {
      console.log('Unknown message type:', type);
      api.error(message, filename);
    }
  }

  return (data, api) => {
    const result = data.query(query);

    for (const item of result) {
      if (!item.assert) {
        callAPI(api, { type: item.type, message: item.message, filename: item.filename });
      }
    }
  };
}

function handleValidator(validator) {
  const validatorPath = path.resolve(validator);
  const ext = path.extname(validatorPath);

  if (ext === '.js') {
    validator = require(validatorPath);
  } else {
    validator = fs.readFileSync(validatorPath, 'utf8');
  }

  if (typeof validator === 'string') {
    validator = makeQueryValidator(validator);
  }

  return validator;
}

module.exports = function (yargs) {
  return yargs.command(
    'validate [validator] [input]',
    `[BETA] Validate one or more JSON stats
Examples:
Single stats: validate path/to/validator.js path/to/stats.json
Multiple stats: generate path/to/validator.js --input path/to/stats-1.json path/to/stats-2.json`,
    (yargs) => {
      return yargs
        .positional('validator', {
          describe: 'path to validator script',
          alias: 'v',
          type: 'string',
        })
        .positional('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('warn-as-error', {
          type: 'boolean',
          describe: 'Treat warnings as errors',
          alias: 'w',
        })
        .array('input')
        .demandOption(['validator', 'input']);
    },
    async (argv) => {
      const files = [];
      for (const file of argv.input) {
        const data = await parseChunked(fs.createReadStream(file));
        files.push({
          name: path.basename(file),
          data,
        });
      }
      const prepared = prepareWithJora(files, { helpers: joraHelpers() });
      const validator = handleValidator(argv.validator);
      const storage = {};
      let hasErrors = false;
      let errors = 0;
      let warnings = 0;
      let infos = 0;
      const api = {
        warn(message, filename = 'unknown') {
          if (argv['warn-as-error']) {
            hasErrors = true;
          }

          storage[filename] = storage[filename] || [];
          storage[filename].push({ type: 'warn', filename, message });
          warnings++;
        },
        error(message, filename = 'unknown') {
          hasErrors = true;
          storage[filename] = storage[filename] || [];
          storage[filename].push({ type: 'error', filename, message });
          errors++;
        },
        info(message, filename = 'unknown') {
          storage[filename] = storage[filename] || [];
          storage[filename].push({ type: 'info', filename, message });
          infos++;
        },
      };

      await validator({ files: prepared.files, query: prepared.query }, api);

      for (const [filename, items] of Object.entries(storage)) {
        console.log(filename);

        for (const item of items) {
          console.log(`  ${item.type}: ${item.message}`);
        }
      }

      console.log('');

      if (errors) {
        console.log(`Errors: ${errors}`);
      }

      if (warnings) {
        console.log(`Warnings: ${warnings}`);
      }
      if (infos) {
        console.log(`Infos: ${infos}`);
      }

      if (hasErrors) {
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }
    }
  );
};
