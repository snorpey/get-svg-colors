/* globals describe, it */

const svgStr = '<svg viewBox="0 0 553 96.5"><rect width="20" height="20" x="2" y="23" fill="red" stroke="green" /></svg>';

function rgb2hex ( str ) {
	const rgb = str.match( /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i );
	
	return ( rgb && rgb.length === 4 ) ? (
		"#" +
		( '0' + parseInt( rgb[1], 10 ).toString( 16 ) ).slice( -2 ) +
		( '0' + parseInt( rgb[2], 10 ).toString( 16 ) ).slice( -2 ) +
		( '0' + parseInt( rgb[3], 10 ).toString( 16 ) ).slice( -2 )
	).toLowerCase() : str;
}

describe( 'get-svg-colors', () => {

	it( 'is a function', () => {
		expect( getSVGColors ).to.be.a( 'function' );
	} );

	it ( 'accepts a filepath and returns an object', () => {
		return getSVGColors( 'http://localhost:9876/base/fixtures/australia.svg' )
			.then( colors => {
				expect( colors.fills ).to.be.an.instanceof( Array );
				expect( colors.strokes ).to.be.an.instanceof( Array );
			} );
	} );

	it ( 'accepts an SVG string as input', () => {
		return getSVGColors( svgStr )
			.then( colors => {
				expect( colors.fills ).to.be.an.instanceof( Array );
				expect( colors.fills ).to.have.lengthOf( 1 );
				expect( colors.strokes ).to.be.an.instanceof( Array );
				expect( colors.strokes ).to.have.lengthOf( 1 );
			} );
	} );

	it ( 'accepts a `flat` option to return a single array include fill and stroke colors', () => {
		return getSVGColors('http://localhost:9876/base/fixtures/australia.svg', {flat: true})
			.then( colors => {
				expect( colors ).to.be.an.instanceof( Array );
				expect( colors ).to.have.lengthOf( 9 );
			} );
	} );

	it ( 'extracts inline styles', () => {
		return getSVGColors( 'http://localhost:9876/base/fixtures/inline-styles.svg' )
			.then( colors => {
				expect( colors.fills.map( rgb2hex ) ).to.include( '#ffcc00' );
				expect( colors.strokes.map( rgb2hex ) ).to.include( '#803300' );
				expect( colors.stops.map( rgb2hex ) ).to.include( '#000000' );
			} );
	} );

	it ( 'extracts inline stylesheet styles', () => {
		return getSVGColors( 'http://localhost:9876/base/fixtures/inline-stylesheet.svg' )
			.then( colors => {
				expect( colors.fills.map( rgb2hex ) ).to.include( '#1d9053' );
				expect( colors.fills ).to.include( 'white' );
			} );
	} );

	it( 'supports radial gradients', () => {
		return getSVGColors( 'http://localhost:9876/base/fixtures/radial-gradient.svg' )
			.then( colors => {
				expect( colors.fills.map( rgb2hex ) ).to.include( '#d65252' );
				expect( colors.stops.map( rgb2hex ) ).to.include( '#ffffff' );
				expect( colors.stops.map( rgb2hex ) ).to.include( '#fce0e0' );
			} );
	} );

	it( 'supports radial gradients with `flat` option', () => {
		return getSVGColors( 'http://localhost:9876/base/fixtures/radial-gradient.svg', { flat: true } )
			.then( colors => {
				expect( colors.map( rgb2hex ) ).to.include( '#ffffff' );
				expect( colors.map( rgb2hex ) ).to.include( '#d65252' );
				expect( colors.map( rgb2hex ) ).to.include( '#fce0e0' );
			} );
	} );
} )
