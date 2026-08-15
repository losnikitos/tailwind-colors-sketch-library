NAME := tailwind-colors
SRC := src
ZIP := $(NAME).zip
SKETCH := $(NAME).sketch

.PHONY: all sketch clean

all: sketch

sketch: $(SKETCH)

$(SKETCH): $(shell find $(SRC) -type f)
	rm -f $(ZIP) $(SKETCH)
	cd $(SRC) && zip -r -X ../$(ZIP) .
	mv $(ZIP) $(SKETCH)

clean:
	rm -f $(ZIP) $(SKETCH)
