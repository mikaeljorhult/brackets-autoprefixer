define( function( require ) {
    'use strict';

    var PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
        Defaults = require( 'modules/Defaults' ),
        autoprefixer = require( 'modules/vendor/autoprefixer/Autoprefixer' ),
        preferences = PreferencesManager.getExtensionPrefs( 'mikaeljorhult.bracketsAutoprefixer' );

    /**
     * Process text using Autoprefixer.
     */
    function process( originalText ) {
        var processedText = false,
            browsers = preferences.get( 'browsers' );

        // Return false if not able to process.
        try {
            processedText = autoprefixer.process( originalText, {
                browsers: browsers.length > 0 ? browsers : Defaults.browsers,
                cascade: preferences.get( 'visualCascade' )
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