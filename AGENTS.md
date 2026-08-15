# Sketch Tailwind Primitives Library

This project is dedicated to building a Sketch App Library that implements Tailwind CSS primitives, providing a bridge between Tailwind's design tokens and Sketch.

## Project Goal
Create a comprehensive Sketch Library that allows designers to use Tailwind primitives (colors, spacing, typography, etc.) directly within Sketch, ensuring consistency with Tailwind-based implementations.

## Current Focus
- **Colors**: The full Tailwind CSS v4 palette as Sketch color variables (swatches) named `family/shade` (for example `red/100`), plus a labeled canvas grid of swatch-linked squares.

## Repository Structure
- `src/`: Contains the raw JSON and asset structure of the Sketch file. Sketch files are essentially zipped directories, and we manage the source in this exploded format to allow for easier manipulation and version control.
- `scripts/generate-colors.mjs`: Generates Sketch swatches and the color grid from `tailwindcss/colors` (OKLCH converted to sRGB).
- `tailwind-colors.sketch`: The generated Sketch Library file.
- `Makefile`: Regenerates color JSON from Tailwind, then bundles `src/` into the final `.sketch` file.
- `node_modules/@sketch-hq/sketch-file-format/`: Official Sketch file format JSON Schema (devDependency only; not shipped). Use it as a reference when generating or editing Sketch JSON so the library stays valid against the spec. Start with the compiled schemas in `dist/` (`document.schema.json`, `page.schema.json`, `meta.schema.json`, `user.schema.json`, `file-format.schema.json`).

## Technical Workflow
Color variables and the grid are generated from the installed Tailwind v4 palette. The Sketch file is assembled by zipping the contents of the `src/` folder. Any changes to the library should be made by modifying the JSON files within `src/` (or via scripts that generate them) and then running `make` to update the `.sketch` file.

```bash
# Generate color variables + grid, then bundle the sketch file
make

# Regenerate Sketch JSON from Tailwind colors only
npm run generate
```

Swatch IDs are deterministic (UUID v5 from the variable name) so regenerating the library does not invalidate existing references.

## Agent Instructions
When working on this repository, ensure that:
1. Changes to the Sketch document are reflected in the `src/` directory.
2. The `Makefile` is used to bundle the final asset.
3. Documentation is updated as new primitives (like spacing or shadows) are added.
4. Consult `node_modules/@sketch-hq/sketch-file-format/dist/*.schema.json` when adding or changing Sketch document structure, so generated JSON matches the official file format.
