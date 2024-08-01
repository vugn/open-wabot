/**
 * Returns the first truthy value from the provided arguments.
 * If all arguments are falsy, returns the last argument.
 * @param {...any} args - The values to check.
 * @returns {any} The first truthy value, or the last argument if all are falsy.
 */
function or(...args: any[]): any {
  for (const arg of args) {
    if (arg) return arg;
  }
  return args[args.length - 1];
}

/**
 * Merges provided options with default options, prioritizing provided options.
 * @param {object} defaultOptions - The default options.
 * @param {object} providedOptions - The provided options.
 * @returns {object} Merged options.
 */
function parseOptions(
  defaultOptions: Record<string, any> = {},
  providedOptions: Record<string, any> = {}
): Record<string, any> {
  const options = { ...defaultOptions };

  for (const [key, val] of Object.entries(providedOptions)) {
    options[key] = or(val, options[key]);
  }

  return options;
}

// Exported functions
export { or, parseOptions };
