define( function( require ) {
    'use strict';

    // Get module dependencies.
    var AppInit = brackets.getModule( 'utils/AppInit' ),
        CommandManager = brackets.getModule( 'command/CommandManager' ),
        Commands = brackets.getModule( 'command/Commands' ),
        DocumentManager = brackets.getModule( 'document/DocumentManager' ),
        EditorManager = brackets.getModule( 'editor/EditorManager' ),

        // Get extension modules.
        Paths = require( 'modules/Paths' ),
        Preferences = require( 'modules/Preferences' ),
        Processor = require( 'modules/Processor' ),

        // Set variables.
        processed = false;

    /**
     * Process whole current file.
     */
    function process() {
        if ( !processed ) {
            var editor = EditorManager.getCurrentFullEditor(),
                currentDocument = editor.document,
                originalText = currentDocument.getText(),
                processedText = Processor.process( originalText ),
                cursorPos = editor.getCursorPos(),
                scrollPos = editor.getScrollPos();

            // Bail if processing was unsuccessful.
            if ( processedText === false ) {
                return;
            }

            // Replace text.
            currentDocument.setText( processedText );

            // Restore cursor and scroll positons.
            editor.setCursorPos( cursorPos );
            editor.setScrollPos( scrollPos.x, scrollPos.y );

            // Save file.
            CommandManager.execute( Commands.FILE_SAVE );

            // Prevent file from being processed multiple times.
            processed = true;
        } else {
            processed = false;
        }
    }

    /**
     * Setup listeners when App is ready.
     */
    AppInit.appReady( function() {
        // Process document when saved.
        DocumentManager.on( 'documentSaved.autoprefixer', function ( event, document ) {
            // Bail if extension's not enabled.
            if ( !Preferences.get( 'enabled' ) ) {
                return;
            }

            // Only check CSS documents.
            if ( document === DocumentManager.getCurrentDocument() && Paths.isFileType( document, [ 'css' ] ) ) {
                process();
            }
        } );
    } );

    // Return object with default values.
    return {
        process: process
    };
} );