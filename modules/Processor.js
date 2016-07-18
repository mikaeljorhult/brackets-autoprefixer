define( function( require ) {
    'use strict';

    var Preferences = require( 'modules/Preferences' ),
        autoprefixer = require( 'modules/vendor/autoprefixer/Autoprefixer' );

    /**
     * Process text using Autoprefixer.
     */
    function process( toProcess ) {
        var type = toProcess.constructor.name.toLowerCase(),
            processedText;

        switch ( type ) {
            case 'document':
                processedText = processDocument( toProcess );
                break;

            case 'file':
                processedText = processFile( toProcess );
                break;

            default:
                processedText = processText( toProcess );
                break;
        }

        return processedText;
    }

    function processDocument( document ) {
        var processedText = processText( document.getText() )

        // Check that process was successful before replacing text.
        if ( processedText ) {
            document.refreshText( processedText, document.diskTimestamp );

            return true;
        }

        return false;
    }

    function processFile( file ) {
        // Read file.
        file.read( function( error, content ) {
            var processedContent;

            // Only process file if it was read without errors.
            if ( !error ) {
                processedContent = processText( content );

                // Store result if text was successfully prefixed.
                if ( processedContent ) {
                    // Write processed content to file.
                    file.write( processedContent );
                }

                return true;
            }

            return false;
        } );
    }

    function processText( text ) {
        var processedText = false,
            browsers = Preferences.get( 'browsers' );

        // Return false if not able to process.
        try {
            processedText = autoprefixer.process( text, {
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