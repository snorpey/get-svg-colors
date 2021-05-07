const { readFile, writeFile } = require( 'fs' );
const { rollup } = require( 'rollup' );
const buble = require( '@rollup/plugin-buble' );
const UglifyJS = require( 'uglify-js' );
const UglifyES = require( 'uglify-es' );
const cleanup = require( 'rollup-plugin-cleanup' );
const extract = require( 'extract-comments' );
const license = require( 'rollup-plugin-license' );

const program = require( 'commander' );
const version = require('./package.json').version;

program
	.version( version )
	.option('-e, --es5', 'export es5 code' )
	.option('-m, --minify', 'minify output' )
	.parse( process.argv );

const es5Build = !! program.es5;
const minifyBuild = !! program.minify;
const bundleUMD = es5Build;

const globalPath = './';
const buildPath = 'dist/';
const minifyExtension = 'min';
const es6Extension = 'es';

const moduleName = 'getSVGColors';
const fileName = require( './package.json' ).name;
const mainFilePath = 'index.js';

const licenseComments = [ ];

console.log( 'building with options: es6:', ! es5Build, 'minify:', minifyBuild );

createES6Bundle( globalPath + mainFilePath )
	.then( fileContent => {
		console.log( 'build complete. file saved to ' + buildPath + getOutputFileName( mainFilePath ) );
	} );

function createES6Bundle ( filePath ) {
	const format = ( es5Build || bundleUMD ) ? 'umd' : 'es';

	return processES6File( filePath, format, moduleName )
		.then( fileContent => {
			return processFileContent(fileContent)
		} )
		.then( fileContent => {
			if ( licenseComments.length ) {
				fileContent = licenseComments
					.filter( comment => comment && comment.value && comment.value.length )
					.map( comment => '/* ' + comment.value + ' */' )
					.join( '\n\n' ) + '\n\n' + fileContent;
			}
			
			fileContent = fileContent.replace( '/**/', '' );

			return saveFile( buildPath + getOutputFileName( mainFilePath ), fileContent );
		} );
}

function processES6File ( filePath, format = 'es', moduleName ) {
	const licenseOptions = {
		banner: `
	<%= pkg.name %> v<%= pkg.version %>
	Copyright (c) <%= moment().format('YYYY') %> <%= pkg.author.name %>
	@license <%= pkg.license %>
	<%= pkg.repository %>

`
	};
	
	const rollupPlugins = [ license( licenseOptions ) ];
	
	// es5 output
	if ( es5Build ) { rollupPlugins.push( buble() ); }

	// remove comments
	rollupPlugins.push( cleanup() );
	
	const rollupOptions = {
		input: filePath,
		plugins: rollupPlugins
	};

	return rollup( rollupOptions )
		.then( bundle => {
			const bundleOpts = { format };

			if ( moduleName ) {
				bundleOpts.name = moduleName;
			}

			return bundle
				.generate( bundleOpts )
				.then( bundleData => {
					const code = Array.isArray( bundleData.output )
						? bundleData.output[0].code
						: bundleData.output.code;
					return code;
				} );
		}, err => {
			console.log( err );
		} );
}

function processFileContent ( fileContent ) {
	fileContent = extractLicenseComments( fileContent )
	
	if ( minifyBuild ) {
		return compressFileContent( fileContent );
	} else {
		return Promise.resolve( fileContent );
	}
}

function loadFile ( filePath ) {
	return new Promise( function ( resolve, reject ) {
		readFile( filePath, 'utf8', ( err, data ) => {
			if ( err ) {
				reject( err );
			} else {
				resolve( data );
			}
		} );
	} );
}

function saveFile ( filePath, fileContent ) {
	return new Promise( function ( resolve, reject ) {
		writeFile( filePath, fileContent, 'utf8', ( err, res ) => {
			if ( err ) {
				reject( err );
			} else {
				resolve( fileContent );
			}
		} );
	} );
}

function compressFileContent ( fileContent ) {
	let res;

	if ( es5Build ) {
		res = UglifyJS.minify( fileContent );
	} else {
		res = UglifyES.minify( fileContent );
	}

	if ( res.error ) {
		console.log( res.error );
	}
	
	return res.code;
}

function fileToBlobURL ( fileContent, type = 'text/javascript' ) {
	if ( minifyBuild ) {
		fileContent = compressFileContent( fileContent );
	}
	
	const fileContentStr = JSON.stringify( fileContent );

	return "URL.createObjectURL(new Blob([" + fileContentStr + "],{type:'" + type + "'}))";
}

function extractLicenseComments ( fileContent ) {
	// https://github.com/aMarCruz/rollup-plugin-cleanup/blob/master/src/parse-options.js
	const licenseRegex = /(?:@license|@preserve|@cc_on)\b/;

	// extract file contents out of code and move them to beginning of file
	const comments = extract( fileContent )
		.filter( comment => licenseRegex.test( comment.value ) );

	comments.forEach( comment => {
		fileContent = fileContent.replace( comment.raw, '' );

		licenseComments.push( comment );
	} );

	return fileContent;
}

function sanitizePathForRegEx ( path ) {
	return path
		.replace( /\//g, '\\/' )
		.replace( /\-/g, '\\-' )
		.replace( /\(/g, '\\(' )
		.replace( /\"/g, '\\"' )
		.replace( /\./g, '\\.' );
}

function getOutputFileName ( filePath ) {
	let fileNameParts = [ fileName ];
	let fileExtension = [ 'js' ];

	if ( minifyBuild && minifyExtension && minifyExtension.length ) {
		fileExtension.unshift( minifyExtension );
	}

	if ( ! es5Build && es6Extension && es6Extension.length ) {
		fileExtension.unshift( es6Extension );
	}

	return fileNameParts.join( '-' ) + '.' + fileExtension.join( '.' );
}