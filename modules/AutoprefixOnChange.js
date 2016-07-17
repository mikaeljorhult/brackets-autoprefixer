define( function( require ) {
    'use strict';

    // Get module dependencies.
    var AppInit = brackets.getModule( 'utils/AppInit' ),
        DocumentManager = brackets.getModule( 'document/DocumentManager' ),
        EditorManager = brackets.getModule( 'editor/EditorManager' ),
        FileSystem = brackets.getModule( 'filesystem/FileSystem' ),
        LanguageManager = brackets.getModule( 'language/LanguageManager' ),

        // Get extension modules.
        Paths = require( 'modules/Paths' ),
        Preferences = require( 'modules/Preferences' ),
        Processor = require( 'modules/Processor' ),

        // Variables.
        processing = [];

    /**
     * Read changed file, autoprefix content and store result.
     */
    function process( file ) {
        // Bail if file is already processed to avoid loop.
        if ( processing.indexOf( file.fullPath ) > -1 ) {
            processing.splice( processing.indexOf( file.fullPath ), 1 );
            return;
        }

        // Read file.
        file.read( function( error, content ) {
            var processedContent;

            // Only process file if it was read without errors.
            if ( !error ) {
                processedContent = Processor.process( content );

                // Store result if text was successfully prefixed.
                if ( processedContent ) {
                    // Add filename to list of files being processed.
                    processing.push( file.fullPath );

                    // Write processed content to file.
                    file.write( processedContent );
                }
            }
        } );
    }

    /**
     * Setup listeners when App is ready.
     */
    AppInit.appReady( function() {
        // Listeners for file changes.
        FileSystem.on( 'change.autoprefixer', function( event, file ) {
            // Bail if change detection is not enabled.
            if ( !Preferences.get( 'onChange' ) ) {
                return;
            }

            // Bail if not a file or file is outside current project root.
            if ( file === null || file.isFile !== true || file.fullPath.indexOf( Paths.projectRoot() ) === -1 ) {
                return;
            }

            if ( [ 'css' ].indexOf( LanguageManager.getLanguageForPath( file.fullPath ).getId() ) > -1 ) {
                process( file );
            }
        } );
    } );

    // Return object with default values.
    return {};
} );