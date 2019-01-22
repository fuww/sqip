// #############################################################################
// #
// # "SQIP" (pronounced \skwɪb\ like the non-magical folk of magical descent)
// # is a SVG-based LQIP technique - https://github.com/technopagan/sqip
// #
// # Installation as CLI:
// # npm install -g sqip
// #
// # Installation as lib:
// # npm install sqip
// #
// # Requirements:
// # * Node.js >= v6 (https://nodejs.org/en/)
// #
// #############################################################################

import 'babel-polyfill'

import path from 'path'

import fs from 'fs-extra'

const { getDimensions } = require('./utils/helpers')
const { checkForPrimitive, runPrimitive } = require('./utils/primitive')
const { runSVGO, prepareSVG, applyBlurFilter } = require('./utils/svg')

export default async function sqip(options) {
  // Build configuration based on passed options and default options
  const defaultOptions = {
    numberOfPrimitives: 8,
    mode: 0,
    blur: 12
  }
  const config = Object.assign({}, defaultOptions, options)

  // Validate configuration and primitive executable status
  checkForPrimitive()

  if (!config.input) {
    throw new Error(
      'Please provide an input image, e.g. sqip({ input: "input.jpg" })'
    )
  }

  const inputPath = path.resolve(config.input)

  try {
    await fs.access(inputPath, fs.constants.R_OK)
  } catch (err) {
    throw new Error(`Unable to read input file: ${inputPath}`)
  }

  // Prepare options for later steps
  const { numberOfPrimitives, mode } = config

  const imgDimensions = getDimensions(inputPath)
  const primitiveOptions = {
    numberOfPrimitives,
    mode
  }

  // Run primitive
  const primitiveOutput = await runPrimitive(
    inputPath,
    primitiveOptions,
    imgDimensions
  )

  // Prepare SVG
  const preparedSVG = prepareSVG(primitiveOutput, imgDimensions)

  // Apply blur filter
  const blurredSVG = applyBlurFilter(preparedSVG, { blur: config.blur })

  // Optimize SVG
  const finalSvg = await runSVGO(blurredSVG)

  // Write to disk or output result
  if (config.output) {
    const outputPath = path.resolve(config.output)
    await fs.writeFile(outputPath, finalSvg.data)
  }

  return { finalSvg, imgDimensions }
}
