define( function( require ) {
    'use strict';

    // Get module dependencies.
    var AppInit = brackets.getModule( 'utils/AppInit' ),
        DocumentManager = brackets.getModule( 'document/DocumentManager' ),
        EditorManager = brackets.getModule( 'editor/EditorManager' ),
        FileSystem = brackets.getModule( 'filesystem/FileSystem' ),

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

        // Pass file for processing.
        if ( Processor.process( file ) ) {
            // Add filename to list of files being processed.
            processing.push( file.fullPath );
        }
    }

    /**
     * Setup listeners when App is ready.
     */
    AppInit.appReady( function() {
        // Listeners for file changes.
        FileSystem.on( 'change.autoprefixer', function( event, file ) {
            var document;

            // Bail if change detection is not enabled.
            if ( !Preferences.get( 'onChange' ) ) {
                return;
            }

            // Bail if not a file or file is outside current project root.
            if ( !Paths.isFileInProjectRoot( file ) ) {
                return;
            }

            // Only process CSS files.
            if ( Paths.isFileType( file, [ 'css' ] ) ) {
                // Check if file is open in an editor.
                document = DocumentManager.getOpenDocumentForPath( file.fullPath );

                if ( document ) {
                    // No need to process current document if on save is enabled.
                    if ( EditorManager.getCurrentFullEditor().document.file.fullPath === file.fullPath ) {
                        return;
                    }

                    Processor.process( document );
                }

                // Go ahead and process.
                process( file );
            }
        } );
    } );

    // Return object with default values.
    return {};
} );