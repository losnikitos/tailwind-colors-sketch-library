NAME := tailwind-colors
SRC := src
ZIP := $(NAME).zip
SKETCH := $(NAME).sketch
PLUGIN := $(NAME).sketchplugin
PLUGIN_ZIP := $(PLUGIN).zip
PLUGIN_SRC := plugin
ICON_SRC := doc/sketch-icon.png
SKETCH_PLUGINS := $(HOME)/Library/Application Support/com.bohemiancoding.sketch3/Plugins

.PHONY: all sketch generate plugin install clean

all: plugin

generate:
	node scripts/generate-colors.mjs

sketch: generate
	rm -f $(ZIP) $(SKETCH)
	cd $(SRC) && zip -r -X ../$(ZIP) .
	mv $(ZIP) $(SKETCH)

plugin: sketch
	rm -rf $(PLUGIN) $(PLUGIN_ZIP)
	mkdir -p $(PLUGIN)/Contents/Sketch $(PLUGIN)/Contents/Resources
	COPYFILE_DISABLE=1 cp $(PLUGIN_SRC)/add-library.js $(PLUGIN)/Contents/Sketch/
	node scripts/sync-plugin-version.mjs $(PLUGIN)/Contents/Sketch/manifest.json
	COPYFILE_DISABLE=1 sips -z 128 128 $(ICON_SRC) --out $(PLUGIN)/Contents/Resources/icon.png >/dev/null
	COPYFILE_DISABLE=1 cp $(SKETCH) $(PLUGIN)/Contents/Resources/$(SKETCH)
	find $(PLUGIN) -name '._*' -delete
	zip -r -X $(PLUGIN_ZIP) $(PLUGIN)

install: plugin
	mkdir -p "$(SKETCH_PLUGINS)"
	rm -rf "$(SKETCH_PLUGINS)/$(PLUGIN)"
	cp -R $(PLUGIN) "$(SKETCH_PLUGINS)/$(PLUGIN)"

clean:
	rm -rf $(ZIP) $(SKETCH) $(PLUGIN) $(PLUGIN_ZIP)
