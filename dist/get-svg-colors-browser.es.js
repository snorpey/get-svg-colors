/* 
get-svg-colors-browser v0.0.1
Copyright (c) 2018 Georg Fischer
@license MIT
https://github.com/snorpey/get-svg-colors-browser.git */



const htmlCommentRegex = /<!--([\s\S]*?)-->/g;
const svgNamespace =  'http://www.w3.org/2000/svg';
const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/i;
const colornames = [
	'black','silver','gray','white','maroon','red','purple','fuchsia','green','lime',
	'olive','yellow','navy','blue','teal','aqua','aliceblue','antiquewhite','aqua',
	'aquamarine','azure','beige','bisque','black','blanchedalmond','blue','blueviolet',
	'brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue',
	'cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray',
	'darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange',
	'darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray',
	'darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray',
	'dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','fuchsia',
	'gainsboro','ghostwhite','gold','goldenrod','gray','green','greenyellow',
	'grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender',
	'lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan',
	'lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink',
	'lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey',
	'lightsteelblue','lightyellow','lime','limegreen','linen','magenta','maroon',
	'mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen',
	'mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred',
	'midnightblue','mintcream','mistyrose','moccasin','navajowhite','navy',
	'oldlace','olive','olivedrab','orange','orangered','orchid','palegoldenrod',
	'palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru',
	'pink','plum','powderblue','purple','red','rosybrown','royalblue','saddlebrown',
	'salmon','sandybrown','seagreen','seashell','sienna','silver','skyblue',
	'slateblue','slategray','slategrey','snow','springgreen','steelblue','tan',
	'teal','thistle','tomato','turquoise','violet','wheat','white','whitesmoke',
	'yellow','yellowgreen'
];
function unique ( value, index, arr ) {
	return arr.indexOf(value) === index;
}
function compact ( arr ) {
	var index = -1,
	    length = arr ? arr.length : 0,
	    resIndex = 0,
	    result = [ ];
	while ( ++index < length ) {
		var value = arr[index];
		if ( value ) {
			result[resIndex++] = value;
		}
	}
	return result;
}
function toLowerCase ( str ) {
	return str.toLowerCase();
}
function isColorString ( str ) {
	if ( ! str ) {
		return false;
	}
	if ( str === 'none' ) {
		return false;
	}
	if ( colornames.indexOf( str.toLowerCase() ) !== -1 ) {
		return true;
	}
	return str.match( colorRegex );
}
function svgElFromString ( str ) {
	const parser = new DOMParser();
	if ( str.indexOf('xmlns') === -1 && str.indexOf('<svg') !== -1 ){
		str.replace('<svg', `<svg xmlns="${svgNamespace}"`);
	}
	return parser.parseFromString( str, 'image/svg+xml' );
}
function isSVGStr ( str ) {
	const regex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:\[?(?:\s*<![^>]*>\s*)*\]?)*[^>]*>\s*)?<svg[^>]*>[^]*<\/svg>\s*$/i;
	return regex.test( str.replace( htmlCommentRegex, '' ) );
}
function isSVGEl ( el ) {
	return el instanceof SVGElement
}
function getEls ( selector, parentEl ) {
	return Array.prototype.slice.call( parentEl.querySelectorAll( selector ) );
}
function getSVGEl ( input, options ) {
	if( isSVGEl ( input ) ) {
		return Promise.resolve( input );
	} else {
		if ( isSVGStr( input ) ) {
			return Promise.resolve( svgElFromString ( input ) );
		} else {
			if ( typeof input === 'string' ) {
				return fetch( input )
					.then( res => res.text() )
					.then( str => svgElFromString( str ) );
			}
		}
	}
}
function getSVGColors ( input, options ) {
	return getSVGEl( input, options )
		.then( svgEl => {
			const fills = getEls( '[fill]', svgEl )
				.map( el => el.getAttribute( 'fill' ) );
			const strokes = getEls( '[stroke]', svgEl )
				.map( el => el.getAttribute( 'stroke') );
			const stops = getEls( '[stop-color]', svgEl )
				.map(el => el.getAttribute( 'stop-color' ) );
			getEls( '[style]', svgEl ).forEach( el => {
				fills.push( el.style.fill );
				strokes.push( el.style.stroke );
				stops.push( el.style.stopColor );
			} );
			if ( options && options.flat ) {
				return compact(
					fills
						.concat( strokes )
						.concat( stops )
						.filter( isColorString )
						.map( toLowerCase )
						.filter( unique )
				);
			}
			return {
				fills: compact(
					fills
						.filter( isColorString )
						.map( toLowerCase )
						.filter( unique )
				),
				strokes: compact(
					strokes
						.filter( isColorString )
						.map( toLowerCase )
						.filter( unique )
				),
				stops: compact(
					stops
						.filter( isColorString )
						.map( toLowerCase )
						.filter( unique )
				)
			};
	} );
}

export default getSVGColors;
