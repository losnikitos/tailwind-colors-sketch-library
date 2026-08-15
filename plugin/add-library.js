const sketch = require('sketch')
const path = require('path')
const Settings = require('sketch/settings')

const { Library, UI } = sketch

const LIBRARY_FILE = 'tailwind-colors.sketch'
const SUPPORT_FOLDER = 'com.losnikitos.tailwind-colors'
const INSTALLED_KEY = 'libraryInstalled'

function bundledLibraryPath(context) {
  if (typeof path.resourcePath === 'function') {
    const resource = path.resourcePath(LIBRARY_FILE)
    if (resource) return String(resource)
  }

  if (context && context.plugin) {
    const url = context.plugin.urlForResourceNamed(LIBRARY_FILE)
    if (url) return String(url.path())
  }

  return null
}

function installedLibraryPath() {
  return `${String(NSHomeDirectory())}/Library/Application Support/${SUPPORT_FOLDER}/${LIBRARY_FILE}`
}

function isSourceNewer(source, destination) {
  const fm = NSFileManager.defaultManager()
  const sourceAttrs = fm.attributesOfItemAtPath_error(source, null)
  const destAttrs = fm.attributesOfItemAtPath_error(destination, null)
  if (!sourceAttrs || !destAttrs) return true

  const sourceDate = sourceAttrs.objectForKey(NSFileModificationDate)
  const destDate = destAttrs.objectForKey(NSFileModificationDate)
  if (!sourceDate || !destDate) return true

  return Number(sourceDate.compare(destDate)) > 0
}

function copyLibraryToSupportFolder(source) {
  const fm = NSFileManager.defaultManager()
  const destination = installedLibraryPath()
  const destDir = destination.slice(0, destination.lastIndexOf('/'))

  if (!fm.fileExistsAtPath(destDir)) {
    const created = fm.createDirectoryAtPath_withIntermediateDirectories_attributes_error(
      destDir,
      true,
      null,
      null,
    )
    if (!created) {
      throw new Error('Could not create the Tailwind Colors library folder.')
    }
  }

  if (fm.fileExistsAtPath(destination) && !isSourceNewer(source, destination)) {
    return destination
  }

  if (fm.fileExistsAtPath(destination)) {
    fm.removeItemAtPath_error(destination, null)
  }

  const copied = fm.copyItemAtPath_toPath_error(source, destination, null)
  if (!copied) {
    throw new Error('Could not install the Tailwind Colors library file.')
  }

  return destination
}

function addLibrary(context, { notify } = {}) {
  try {
    const source = bundledLibraryPath(context)
    if (!source) {
      if (notify) UI.message('Could not find the Tailwind Colors library in the plugin.')
      return
    }

    const libraryPath = copyLibraryToSupportFolder(source)
    const library = Library.getLibraryForDocumentAtPath(libraryPath)

    if (!library || !library.valid) {
      if (notify) UI.message('Could not add the Tailwind Colors library.')
      return
    }

    const firstInstall = !Settings.settingForKey(INSTALLED_KEY)
    if (notify || firstInstall) {
      library.enabled = true
      Settings.setSettingForKey(INSTALLED_KEY, true)
    }

    if (notify) {
      UI.message('Tailwind Colors library added. Pick colors from the Variables tab.')
    }
  } catch (error) {
    if (notify) UI.message(String(error.message || error))
  }
}

function onStartup(context) {
  addLibrary(context, { notify: false })
}

function onRun(context) {
  addLibrary(context, { notify: true })
}