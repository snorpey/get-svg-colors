[![build status](https://travis-ci.org/snorpey/get-svg-colors-browser.svg?branch=master)](https://travis-ci.org/snorpey/get-svg-colors-browser)

# get-svg-colors-browser

extract stroke and fill colors from SVG files. designed for use in the browser, not in node.

for use in node, see [colorjs/get-svg-colors](https://github.com/colorjs/get-svg-colors).

# installation

* [get-svg-colors-browser.min.js](https://raw.githubusercontent.com/snorpey/get-svg-colors-browser/master/dist/get-svg-colors-browser.min.js) 4kb
* [get-svg-colors-browser.es.min.js](https://raw.githubusercontent.com/snorpey/get-svg-colors-browser/master/dist/get-svg-colors-browser.es.min.js) 4kb
* [get-svg-colors-browser.es.js](https://raw.githubusercontent.com/snorpey/get-svg-colors-browser/master/dist/get-svg-colors-browser.es.js) 5kb

`npm install get-svg-colors-browser`

see the [dist](dist) folder for more versions.

## usage

```js
import getSVGColors from 'get-svg-color-browser.es.js'

// give it an SVG filename
getSVGColors('test/fixtures/australia.svg')
	.then( colors => { ... } )

// or an SVG string
getSVGColors('<svg...>')
	.then( colors => { ... } )

// you'll get back an object with two keys: `fills` and `strokes`

// `fills`, `strokes` and `stops` are an arrays of colors
// => ['#FFFFFF', 'rgb(0,128,128)', '#F0F0F0']

// pass the `flat` option to get back a single array including
// de-duped fills and strokes together
getSVGColors('<svg viewBox="0 0 553 96.5"><rect width="20" height="20" x="2" y="23" fill="rgb(0,128,128)" stroke="green" /></svg>', {flat: true})
	.then( colors => { 
		// => ['rgb(0,128,128)', 'green']
	 } )
```

## tests

```sh
npm install
npm test
```

## license

MIT

# missing something?

found a bug? missing a feature? are you using this library in an interesting project? take a look at the [issues](../../issues), open a pull request and let me know.

# most importantly

thank you for taking a look at this repo. have a great day :)
