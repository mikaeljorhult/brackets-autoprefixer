define( function( require ) {
    'use strict';

    var Preferences = require( 'modules/Preferences' ),
        autoprefixer = require( 'modules/vendor/autoprefixer/Autoprefixer' );

    /**
     * Process text using Autoprefixer.
     */
    function process( originalText ) {
        var processedText = false,
            browsers = Preferences.get( 'browsers' );

        // Return false if not able to process.
        try {
            processedText = autoprefixer.process( originalText, {
                browsers: browsers.length > 0 ? browsers : Preferences.defaults.browsers,
                cascade: Preferences.get( 'visualCascade' )
            } ).css;
        } catch ( e ) {
            return false;
        }

        // Return processed text if successful.
        return processedText;
    }

    // Return object with default values.
    return {
        process: process
    };
} );