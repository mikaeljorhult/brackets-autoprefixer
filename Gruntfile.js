module.exports = function( grunt ) {
	'use strict';
	
	// Require all Grunt tasks.
	require( 'load-grunt-tasks' )( grunt );
	
	// Configure each task.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'main.js',
				'modules/*.js',
				'nls/**/*.js'
			]
		}
	} );
	
	// Register tasks.
	grunt.registerTask( 'default', [ 'jshint' ]);
};