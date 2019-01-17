'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { getDimensions } = require('./utils/helpers');
const { checkForPrimitive, runPrimitive } = require('./utils/primitive');
const { runSVGO, prepareSVG, applyBlurFilter } = require('./utils/svg');

exports.default = async function sqip(options) {
  // Build configuration based on passed options and default options
  const defaultOptions = {
    numberOfPrimitives: 8,
    mode: 0,
    blur: 12
  };
  const config = Object.assign({}, defaultOptions, options);

  // Validate configuration and primitive executable status
  checkForPrimitive();

  if (!config.input) {
    throw new Error('Please provide an input image, e.g. sqip({ input: "input.jpg" })');
  }

  const inputPath = _path2.default.resolve(config.input);

  try {
    await _fsExtra2.default.access(inputPath, _fsExtra2.default.constants.R_OK);
  } catch (err) {
    throw new Error(`Unable to read input file: ${inputPath}`);
  }

  // Prepare options for later steps
  const { numberOfPrimitives, mode } = config;

  const imgDimensions = getDimensions(inputPath);
  const primitiveOptions = {
    numberOfPrimitives,
    mode

    // Run primitive
  };const primitiveOutput = await runPrimitive(inputPath, primitiveOptions, imgDimensions);

  // Prepare SVG
  const preparedSVG = prepareSVG(primitiveOutput, imgDimensions);

  // Apply blur filter
  const blurredSVG = applyBlurFilter(preparedSVG, { blur: config.blur });

  // Optimize SVG
  const finalSvg = await runSVGO(blurredSVG);

  // Write to disk or output result
  if (config.output) {
    const outputPath = _path2.default.resolve(config.output);
    await _fsExtra2.default.writeFile(outputPath, finalSvg.data);
  }

  return { finalSvg, imgDimensions };
};

module.exports = exports['default'];