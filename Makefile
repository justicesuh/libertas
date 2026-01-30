.PHONY: build clean

NAME = libertas

FILES = manifest.json \
        background.js \
        popup.html \
        popup.js \
        popup.css \
        blocklist.html \
        blocklist.js \
        blocked.html \
        blocked.js \
        presets.js \
        icons/

build:
	zip -r $(NAME).zip $(FILES)

clean:
	rm -f *.zip *.xpi
