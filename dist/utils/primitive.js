'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _tempy = require('tempy');

var _tempy2 = _interopRequireDefault(_tempy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const VENDOR_DIR = _path2.default.resolve(__dirname, '..', '..', 'vendor');
let primitiveExecutable = 'primitive';

// Since Primitive is only interested in the larger dimension of the input image, let's find it
const findLargerImageDimension = ({ width, height }) => width > height ? width : height;

// Sanity check: use the exit state of 'type' to check for Primitive availability
const checkForPrimitive = async () => {
  const primitivePath = _path2.default.join(VENDOR_DIR, `primitive-${_os2.default.platform()}-${_os2.default.arch()}`);

  if (await _fsExtra2.default.exists(primitivePath)) {
    primitiveExecutable = primitivePath;
    return;
  }

  const errorMessage = 'Please ensure that Primitive (https://github.com/fogleman/primitive, written in Golang) is installed and globally available';
  try {
    if (_os2.default.platform() === 'win32') {
      await (0, _execa2.default)('where', ['primitive']);
    } else {
      await (0, _execa2.default)('type', ['primitive']);
    }
  } catch (e) {
    throw new Error(errorMessage);
  }
};

// Run Primitive with reasonable defaults (rectangles as shapes, 9 shaper per default) to generate the placeholder SVG
const runPrimitive = async (filename, { numberOfPrimitives = 8, mode = 0 }, dimensions) => {
  const primitiveTempFile = _tempy2.default.file({ extension: 'svg' });

  await (0, _execa2.default)(primitiveExecutable, ['-i', filename, '-o', primitiveTempFile, '-n', numberOfPrimitives, '-m', mode, '-s', findLargerImageDimension(dimensions)]);

  const result = await _fsExtra2.default.readFile(primitiveTempFile, {
    encoding: 'utf-8'
  });

  await _fsExtra2.default.unlink(primitiveTempFile);

  return result;
};

module.exports = {
  checkForPrimitive,
  runPrimitive
};