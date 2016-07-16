/*!
 * Brackets Autoprefixer 0.6.4
 * Parse CSS and add vendor prefixes automatically.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define( function( require ) {
	'use strict';

	// Get module dependencies.
	var Menus = brackets.getModule( 'command/Menus' ),
		CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),

		// Get extension modules.
		Preferences = require( 'modules/Preferences' ),
		Processor = require( 'modules/Processor' ),
		Strings = require( 'modules/Strings' ),
		SettingsDialog = require( 'modules/SettingsDialog' ),

		// Setup extension.
		COMMAND_ID_AUTOSAVE = 'mikaeljorhult.bracketsAutoprefixer.enable',
		COMMAND_ID_SELECTION = 'mikaeljorhult.bracketsAutoprefixer.selection',
		COMMAND_ID_SETTINGS = 'mikaeljorhult.bracketsAutoprefixer.settings',
		processed = false,

		// Hook into menus.
		menu = Menus.getMenu( Menus.AppMenuBar.EDIT_MENU );

	/**
	 * Set state of extension.
	 */
	function toggleAutoprefixer() {
		var enabled = Preferences.get( 'enabled' );

		enableAutoprefixer( !enabled );
	}

	/**
	 * Initialize extension.
	 */
	function enableAutoprefixer( enabled ) {
		// Save enabled state.
		Preferences.set( 'enabled', enabled );

		// Mark menu item as enabled/disabled.
		CommandManager.get( COMMAND_ID_AUTOSAVE ).setChecked( enabled );
	}

	/**
	 * Process whole current file.
	 */
	function run() {
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
	 * Process current selection.
	 */
	function processSelection() {
		var editor = EditorManager.getCurrentFullEditor(),
			currentSelection,
			originalText,
			processedText;

		// Only proceed if there is a selection.
		if ( editor.hasSelection() ) {
			// Get position and text of selection.
			currentSelection = editor.getSelection();
			originalText = editor.getSelectedText();
			processedText = Processor.process( originalText );

			if ( processedText !== false ) {
				// Replace selected text with processed text.
				editor.document.replaceRange( processedText, currentSelection.start, currentSelection.end );
			}
		}
	}

	// Register extension.
	CommandManager.register( Strings.MENU_ON_SAVE, COMMAND_ID_AUTOSAVE, toggleAutoprefixer );
	CommandManager.register( Strings.MENU_SELECTION, COMMAND_ID_SELECTION, processSelection );
	CommandManager.register( Strings.MENU_SETTINGS, COMMAND_ID_SETTINGS, SettingsDialog.show );

	// Add command to menu.
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID_AUTOSAVE );
	menu.addMenuItem( COMMAND_ID_SELECTION );
	menu.addMenuItem( COMMAND_ID_SETTINGS );

	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		// Process document when saved.
		DocumentManager.on( 'documentSaved.autoprefixer', function( event, document ) {
			// Bail if extension's not enabled.
			if ( !Preferences.get( 'enabled' ) ) {
				return;
			}

			// Only check CSS documents.
			if ( document === DocumentManager.getCurrentDocument() && document.language.getName() === 'CSS' ) {
				run();
			}
		} );

		// Enable extension if loaded last time.
		if ( Preferences.get( 'enabled' ) ) {
			enableAutoprefixer( true );
		}
	} );
} );