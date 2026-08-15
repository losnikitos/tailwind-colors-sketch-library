import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { converter } from 'culori'
import tailwindColors from 'tailwindcss/colors'

const toRgb = converter('rgb')

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const PAGE_ID = '26CE87B1-E43D-4749-BBB6-76E67F170B4C'
const NAMESPACE = '8e2f1c4a-9b3d-4e7f-a1c0-5d6b8e9f0123'

const SKIP = new Set(['inherit', 'current', 'transparent'])
const NEUTRAL_FAMILIES = new Set([
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'mauve',
  'olive',
  'mist',
  'taupe',
])

function isPalette(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function shadeSort(a, b) {
  const na = Number(a)
  const nb = Number(b)
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

const SQUARE = 48
const GAP = 8
const RADIUS = 8
const PAD = 40
const LABEL_W = 88
const HEADER_H = 20
const LABEL_COLOR = { _class: 'color', alpha: 1, red: 0.255, green: 0.255, blue: 0.271 }
const FONT = { name: 'Helvetica', size: 11 }

function uuidV5(name) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex')
  const hash = createHash('sha1').update(ns).update(name).digest()
  hash[6] = (hash[6] & 0x0f) | 0x50
  hash[8] = (hash[8] & 0x3f) | 0x80
  const hex = hash.subarray(0, 16).toString('hex').toUpperCase()
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function cssToSketchColor(cssColor) {
  const rgb = toRgb(String(cssColor).replace(/\bnone\b/g, '0'))
  if (!rgb) {
    throw new Error(`Unable to parse color: ${cssColor}`)
  }
  return {
    _class: 'color',
    alpha: clamp01(rgb.alpha ?? 1),
    red: clamp01(rgb.r),
    green: clamp01(rgb.g),
    blue: clamp01(rgb.b),
  }
}

function collectPalette() {
  const families = []
  const baseNames = []

  for (const [name, value] of Object.entries(tailwindColors)) {
    if (SKIP.has(name)) continue
    if (isPalette(value)) {
      families.push(name)
    } else if (typeof value === 'string') {
      baseNames.push(name)
    }
  }

  families.sort((a, b) => Number(NEUTRAL_FAMILIES.has(a)) - Number(NEUTRAL_FAMILIES.has(b)))

  const shadeKeys = new Set()
  const entries = []
  for (const family of families) {
    const scale = tailwindColors[family]
    const familyShades = Object.keys(scale).sort(shadeSort)
    for (const shade of familyShades) {
      shadeKeys.add(shade)
      entries.push({
        name: `${family}-${shade}`,
        family,
        shade,
        css: scale[shade],
      })
    }
  }

  for (const name of baseNames) {
    entries.push({ name, family: 'base', shade: name, css: tailwindColors[name] })
  }

  return {
    families,
    shades: [...shadeKeys].sort(shadeSort),
    entries: entries.map((entry) => {
      const color = cssToSketchColor(entry.css)
      const swatchID = uuidV5(`swatch:${entry.name}`)
      return { ...entry, color, swatchID }
    }),
  }
}

function exportOptions() {
  return {
    _class: 'exportOptions',
    includedLayerIds: [],
    layerOptions: 0,
    shouldTrim: false,
    exportFormats: [],
  }
}

function emptyStyle(id) {
  return {
    _class: 'style',
    do_objectID: id,
    endMarkerType: 0,
    miterLimit: 10,
    startMarkerType: 0,
    windingRule: 1,
    skipCorners: true,
    blurs: [],
    borderOptions: {
      _class: 'borderOptions',
      isEnabled: true,
      dashPattern: [],
      centerDashes: true,
      lineCapStyle: 0,
      lineJoinStyle: 0,
    },
    borders: [],
    colorControls: {
      _class: 'colorControls',
      isEnabled: false,
      brightness: 0,
      contrast: 1,
      hue: 0,
      saturation: 1,
    },
    contextSettings: {
      _class: 'graphicsContextSettings',
      blendMode: 0,
      opacity: 1,
      isProgressive: false,
    },
    fills: [],
    shadows: [],
    innerShadows: [],
  }
}

function layerBase(id, name, frame, { nameIsFixed = true, constrainProportions = false } = {}) {
  return {
    do_objectID: id,
    booleanOperation: -1,
    isFixedToViewport: false,
    isFlippedHorizontal: false,
    isFlippedVertical: false,
    isLocked: false,
    isTemplate: false,
    isVisible: true,
    hasCustomPrototypeVisibility: false,
    hasExplicitConstraints: false,
    horizontalSizing: 0,
    horizontalPins: 1,
    verticalSizing: 0,
    verticalPins: 1,
    prototypeVisibility: 1,
    prototypeVisibilityTrigger: 2,
    layerListExpandedType: 0,
    name,
    nameIsFixed,
    resizingConstraint: 63,
    resizingType: 0,
    rotation: 0,
    shouldBreakMaskChain: false,
    exportOptions: exportOptions(),
    frame: {
      _class: 'rect',
      constrainProportions,
      height: frame.height,
      width: frame.width,
      x: frame.x,
      y: frame.y,
    },
    clippingMaskMode: 0,
    hasClippingMask: false,
    prototypeScrolling: 0,
  }
}

function dummyGradient(color) {
  return {
    _class: 'gradient',
    colorInterpolation: 0,
    elipseLength: 0,
    from: '{0.5, 0}',
    gradientType: 0,
    to: '{0.5, 1}',
    stops: [
      { _class: 'gradientStop', position: 0, color: { ...color } },
      { _class: 'gradientStop', position: 1, color: { ...color } },
    ],
  }
}

function makeRectangle(entry, x, y) {
  const fillColor = { ...entry.color, swatchID: entry.swatchID }
  const points = [
    { point: '{0, 1}', curveFrom: '{0, 1}', curveTo: '{0, 1}' },
    { point: '{1, 1}', curveFrom: '{1, 1}', curveTo: '{1, 1}' },
    { point: '{1, 0}', curveFrom: '{1, 0}', curveTo: '{1, 0}' },
    { point: '{0, 0}', curveFrom: '{0, 0}', curveTo: '{0, 0}' },
  ]

  return {
    ...layerBase(uuidV5(`rect:${entry.name}`), entry.name, {
      x,
      y,
      width: SQUARE,
      height: SQUARE,
    }, { constrainProportions: true }),
    _class: 'rectangle',
    style: {
      ...emptyStyle(uuidV5(`style:rect:${entry.name}`)),
      fills: [
        {
          _class: 'fill',
          isEnabled: true,
          fillType: 0,
          color: fillColor,
          contextSettings: {
            _class: 'graphicsContextSettings',
            blendMode: 0,
            opacity: 1,
            isProgressive: false,
          },
          gradient: dummyGradient(entry.color),
          noiseIndex: 0,
          noiseIntensity: 0,
          patternFillType: 1,
          patternTileScale: 1,
        },
      ],
    },
    edited: false,
    isClosed: true,
    pointRadiusBehaviour: 1,
    fixedRadius: RADIUS,
    hasConvertedToNewRoundCorners: true,
    needsConvertionToNewRoundCorners: false,
    points: points.map((point) => ({
      _class: 'curvePoint',
      cornerRadius: RADIUS,
      cornerStyle: 0,
      curveFrom: point.curveFrom,
      curveMode: 1,
      curveTo: point.curveTo,
      hasCurveFrom: false,
      hasCurveTo: false,
      point: point.point,
    })),
  }
}

function makeText(idKey, string, frame, alignment) {
  const fontAttribute = {
    _class: 'fontDescriptor',
    attributes: { name: FONT.name, size: FONT.size },
  }
  const encoded = {
    MSAttributedStringFontAttribute: fontAttribute,
    MSAttributedStringColorAttribute: LABEL_COLOR,
    paragraphStyle: {
      _class: 'paragraphStyle',
      alignment,
    },
    textStyleVerticalAlignmentKey: 0,
  }

  return {
    ...layerBase(uuidV5(`text:${idKey}`), string, frame),
    _class: 'text',
    style: {
      ...emptyStyle(uuidV5(`style:text:${idKey}`)),
      textStyle: {
        _class: 'textStyle',
        verticalAlignment: 0,
        encodedAttributes: encoded,
      },
    },
    attributedString: {
      _class: 'attributedString',
      string,
      attributes: [
        {
          _class: 'stringAttribute',
          location: 0,
          length: string.length,
          attributes: encoded,
        },
      ],
    },
    automaticallyDrawOnUnderlyingPath: false,
    dontSynchroniseWithSymbol: false,
    lineSpacingBehaviour: 2,
    textBehaviour: 1,
    glyphBounds: `{{0, 0}, {${Math.round(frame.width)}, ${Math.round(frame.height)}}}`,
  }
}

function gridPosition(col, row) {
  const gridX = PAD + LABEL_W + GAP
  const gridY = PAD + HEADER_H + GAP
  return {
    x: gridX + col * (SQUARE + GAP),
    y: gridY + row * (SQUARE + GAP),
  }
}

function buildArtboard({ families, shades, entries }) {
  const byName = new Map(entries.map((entry) => [entry.name, entry]))
  const baseEntries = entries.filter((entry) => entry.family === 'base')
  const rows = families.length + (baseEntries.length > 0 ? 1 : 0)
  const cols = shades.length
  const gridX = PAD + LABEL_W + GAP
  const gridY = PAD + HEADER_H + GAP
  const width = gridX + cols * (SQUARE + GAP) - GAP + PAD
  const height = gridY + rows * (SQUARE + GAP) - GAP + PAD
  const layers = []

  for (let col = 0; col < cols; col += 1) {
    const { x } = gridPosition(col, 0)
    layers.push(
      makeText(
        `header:${shades[col]}`,
        String(shades[col]),
        { x, y: PAD, width: SQUARE, height: HEADER_H },
        2,
      ),
    )
  }

  families.forEach((family, row) => {
    const { y } = gridPosition(0, row)
    layers.push(
      makeText(family, family, { x: PAD, y, width: LABEL_W, height: SQUARE }, 1),
    )
    shades.forEach((shade, col) => {
      const entry = byName.get(`${family}-${shade}`)
      if (!entry) return
      const pos = gridPosition(col, row)
      layers.push(makeRectangle(entry, pos.x, pos.y))
    })
  })

  if (baseEntries.length > 0) {
    const baseRow = families.length
    const { y: baseY } = gridPosition(0, baseRow)
    layers.push(makeText('base', 'base', { x: PAD, y: baseY, width: LABEL_W, height: SQUARE }, 1))
    baseEntries.forEach((entry, col) => {
      const pos = gridPosition(col, baseRow)
      layers.push(makeRectangle(entry, pos.x, pos.y))
    })
  }

  return {
    ...layerBase(uuidV5('artboard:Colors'), 'Colors', { x: 0, y: 0, width, height }),
    _class: 'artboard',
    layerListExpandedType: 1,
    hasClickThrough: true,
    resizesContent: false,
    includeBackgroundColorInExport: true,
    hasBackgroundColor: true,
    isFlowHome: false,
    backgroundColor: { _class: 'color', alpha: 1, red: 1, green: 1, blue: 1 },
    horizontalRulerData: { _class: 'rulerData', base: 0, guides: [] },
    verticalRulerData: { _class: 'rulerData', base: 0, guides: [] },
    groupLayout: { _class: 'MSImmutableFreeformGroupLayout' },
    groupBehavior: 1,
    overlayBackgroundInteraction: 0,
    presentationStyle: 0,
    clippingBehavior: 0,
    leftPadding: 0,
    topPadding: 0,
    rightPadding: 0,
    bottomPadding: 0,
    paddingSelection: 1,
    prototypeScrollingArea: 0,
    style: emptyStyle(uuidV5('style:artboard:Colors')),
    layers,
  }
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

function main() {
  const palette = collectPalette()
  const documentPath = join(SRC, 'document.json')
  const metaPath = join(SRC, 'meta.json')
  const pagePath = join(SRC, 'pages', `${PAGE_ID}.json`)
  const document = JSON.parse(readFileSync(documentPath, 'utf8'))
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  const page = JSON.parse(readFileSync(pagePath, 'utf8'))
  const artboard = buildArtboard(palette)

  document.sharedSwatches.objects = palette.entries.map((entry) => ({
    _class: 'swatch',
    do_objectID: entry.swatchID,
    name: entry.name,
    value: entry.color,
  }))

  page.name = 'Colors'
  page.nameIsFixed = true
  page.layers = [artboard]

  meta.pagesAndArtboards[PAGE_ID] = {
    name: 'Colors',
    artboards: {
      [artboard.do_objectID]: { name: 'Colors' },
    },
  }

  writeJson(documentPath, document)
  writeJson(metaPath, meta)
  writeJson(pagePath, page)

  rmSync(join(SRC, 'images'), { recursive: true, force: true })
  mkdirSync(join(SRC, 'images'), { recursive: true })

  const gridRows = palette.families.length + (palette.entries.some((entry) => entry.family === 'base') ? 1 : 0)
  console.log(`Wrote ${palette.entries.length} Sketch color variables and a ${gridRows}-row grid.`)
}

main()
