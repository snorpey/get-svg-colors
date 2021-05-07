/* 
get-svg-colors-browser v2.0.3
Copyright (c) 2021 Georg Fischer
@license MIT
https://github.com/snorpey/get-svg-colors-browser.git */



(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.getSVGColors = factory());
}(this, (function () { 'use strict';

	var htmlCommentRegex = /<!--([\s\S]*?)-->/g;
	var svgNamespace =  'http://www.w3.org/2000/svg';
	var colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/i;
	var colornames = [
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
		var parser = new DOMParser();
		if ( str.indexOf('xmlns') === -1 && str.indexOf('<svg') !== -1 ){
			str.replace('<svg', ("<svg xmlns=\"" + svgNamespace + "\""));
		}
		return parser.parseFromString( str, 'image/svg+xml' );
	}
	function isSVGStr ( str ) {
		var regex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:\[?(?:\s*<![^>]*>\s*)*\]?)*[^>]*>\s*)?<svg[^>]*>[^]*<\/svg>\s*$/i;
		return regex.test( str.replace( htmlCommentRegex, '' ) );
	}
	function isSVGEl ( el ) {
		return el instanceof SVGElement;
	}
	function getEls ( selector, parentEl ) {
		return toArray( parentEl.querySelectorAll( selector ) );
	}
	function toArray ( list ) {
		return Array.prototype.slice.call( list );
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
						.then( function (res) { return res.text(); } )
						.then( function (str) { return svgElFromString( str ); } );
				}
			}
		}
	}
	function getColorsInCSSStr ( str, type ) {
		var colors = str
			.replace( /(\s|\n|\R|\r)/g, '' )
			.split( /(\{|\}|\;)/ )
			.map( function (part) { return part.trim(); } )
			.map( toLowerCase )
			.filter( function (part) { return part && part.length; } )
			.filter( function (part) { return part.indexOf( type ) === 0; } )
			.map( function (part) { return part.split( ':' ).map( function (part) { return part.trim(); } ).filter( function (p) { return p !== type; } ); } )
			.reduce( function ( results, parts ) { return results.concat( parts ); }, [ ] )
			.filter( function (color) { return colornames.indexOf( color ) !== -1 || colorRegex.test( color ); } );
		return colors;
	}
	function getSVGColors ( input, options ) {
		return getSVGEl( input, options )
			.then( function (svgEl) {
				var fills = getEls( '[fill]', svgEl )
					.map( function (el) { return el.getAttribute( 'fill' ); } );
				var strokes = getEls( '[stroke]', svgEl )
					.map( function (el) { return el.getAttribute( 'stroke'); } );
				var stops = getEls( '[stop-color]', svgEl )
					.map( function (el) { return el.getAttribute( 'stop-color' ); } );
				getEls( '[style]', svgEl )
					.forEach( function (el) {
						fills.push( el.style.fill );
						strokes.push( el.style.stroke );
						stops.push( el.style.stopColor );
					} );
				getEls( 'style', svgEl )
					.forEach( function (styleEl) {
						var styleStr = styleEl.textContent;
						getColorsInCSSStr( styleStr, 'fill' ).forEach( function (c) { return fills.push( c ); } );
						getColorsInCSSStr( styleStr, 'stroke' ).forEach( function (c) { return strokes.push( c ); } );
						getColorsInCSSStr( styleStr, 'stop-color' ).forEach( function (c) { return stops.push( c ); } );
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

	return getSVGColors;

})));
