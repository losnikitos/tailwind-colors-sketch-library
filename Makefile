NAME := tailwind-colors
SRC := src
ZIP := $(NAME).zip
SKETCH := $(NAME).sketch

.PHONY: all sketch generate clean

all: sketch

generate:
	node scripts/generate-colors.mjs

sketch: generate
	rm -f $(ZIP) $(SKETCH)
	cd $(SRC) && zip -r -X ../$(ZIP) .
	mv $(ZIP) $(SKETCH)

clean:
	rm -f $(ZIP) $(SKETCH)
