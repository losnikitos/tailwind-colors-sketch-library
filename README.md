![Tailwind colors for Sketch App](doc/cover.png)

# Tailwind Colors for Sketch

A [Sketch](https://www.sketch.com) library with the full [Tailwind CSS](https://tailwindcss.com/docs/colors) 4.3 palette as native color variables (`blue-500`, `slate-900`, …).

## Installation

### Local library file

<a href="https://github.com/losnikitos/tailwind-colors-sketch-library/releases/latest/download/tailwind-colors.sketch"><img src="doc/download-button.svg" alt="Download tailwind-colors.sketch" height="56"></a>

1. In Sketch, open **Settings…** (`⌘,`).

   ![Open Sketch Settings](doc/step1.png)

2. Go to **Libraries** and click **Add Local Library…**.

   ![Add Local Library](doc/step2.png)

3. Select `tailwind-colors.sketch` and click **Open**.

   ![Select the library file](doc/step3.png)

4. Pick colors from the **Variables** tab in the color picker.

   ![Pick a color variable](doc/step4.png)

### Plugin

<a href="https://github.com/losnikitos/tailwind-colors-sketch-library/releases/latest/download/tailwind-colors.sketchplugin.zip"><img src="doc/download-plugin-button.svg" alt="Download Sketch plugin" height="56"></a>

1. Unzip the download and double-click `tailwind-colors.sketchplugin`.
2. Restart Sketch if it was already open.
3. Pick colors from the **Variables** tab in the color picker.

The plugin copies the library into Application Support and registers it on startup. You can also run **Plugins › Tailwind Colors › Add Tailwind Colors Library**.

Sketch will notify you when an update is available.

## Build

```bash
npm install
make
```

To publish a new plugin version (GitHub release, appcast, Sketch plugin listing):

```bash
npx skpm publish patch
```

## License

MIT. See [LICENSE](LICENSE).
