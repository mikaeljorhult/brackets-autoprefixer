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
		PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		Defaults = require( 'modules/Defaults' ),
		Strings = require( 'modules/Strings' ),
		SettingsDialog = require( 'modules/SettingsDialog' ),
		autoprefixer = require( 'modules/vendor/autoprefixer/Autoprefixer' ),
		
		// Setup extension.
		COMMAND_ID_AUTOSAVE = 'mikaeljorhult.bracketsAutoprefixer.enable',
		COMMAND_ID_SELECTION = 'mikaeljorhult.bracketsAutoprefixer.selection',
		COMMAND_ID_SETTINGS = 'mikaeljorhult.bracketsAutoprefixer.settings',
		preferences = PreferencesManager.getExtensionPrefs( 'mikaeljorhult.bracketsAutoprefixer' ),
		processed = false,
		
		// Hook into menus.
		menu = Menus.getMenu( Menus.AppMenuBar.EDIT_MENU );
		
	// Define preferences.
	preferences.definePreference( 'enabled', 'boolean', false );
	preferences.definePreference( 'visualCascade', 'boolean', false );
	preferences.definePreference( 'browsers', 'object', Defaults.browsers );
	
	/** 
	 * Set state of extension.
	 */
	function toggleAutoprefixer() {
		var enabled = preferences.get( 'enabled' );
		
		enableAutoprefixer( !enabled );
	}
	
	/** 
	 * Initialize extension.
	 */
	function enableAutoprefixer( enabled ) {
		// Save enabled state.
		preferences.set( 'enabled', enabled );
		
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
				processedText = process( originalText ),
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
			processedText = process( originalText );
			
			if ( processedText !== false ) {
				// Replace selected text with processed text.
				editor.document.replaceRange( processedText, currentSelection.start, currentSelection.end );
			}
		}
	}
	
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
	
	/**
	 * Open settings dialog.
	 */
	function showSettingsDialog() {
		SettingsDialog.show( preferences );
	}
	
	// Register extension.
	CommandManager.register( Strings.MENU_ON_SAVE, COMMAND_ID_AUTOSAVE, toggleAutoprefixer );
	CommandManager.register( Strings.MENU_SELECTION, COMMAND_ID_SELECTION, processSelection );
	CommandManager.register( Strings.MENU_SETTINGS, COMMAND_ID_SETTINGS, showSettingsDialog );
	
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
			if ( !preferences.get( 'enabled' ) ) {
				return;
			}
			
			// Only check CSS documents.
			if ( document === DocumentManager.getCurrentDocument() && document.language.getName() === 'CSS' ) {
				run();
			}
		} );
		
		// Enable extension if loaded last time.
		if ( preferences.get( 'enabled' ) ) {
			enableAutoprefixer( true );
		}
	} );
} );