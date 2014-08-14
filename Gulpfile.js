var gulp = require( 'gulp' ),
	plugins = require( 'gulp-load-plugins' )(),
	files = [ 'main.js', 'modules/*.js', 'nls/**/*.js' ];

gulp.task( 'lint', function() {
	return gulp.src( files )
		.pipe( plugins.jshint() )
		.pipe( plugins.jshint.reporter( 'default' ) )
		.pipe( plugins.jscs() );
} );

gulp.task( 'default', [ 'lint' ] );