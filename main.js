/*!
 * Brackets Autoprefixer 0.2.7
 * Parse CSS and add vendor prefixes automatically.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define( function( require, exports, module ) {
	'use strict';
	
	// Get module dependencies.
	var Menus = brackets.getModule( 'command/Menus' ),
		CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
		PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		Strings = require( 'modules/Strings' ),
		SettingsDialog = require( 'modules/SettingsDialog' ),
		autoprefixer = require( 'modules/vendor/autoprefixer/Autoprefixer' ),
		
		// Setup extension.
		COMMAND_ID_AUTOSAVE = 'mikaeljorhult.bracketsAutoprefixer.enable',
		COMMAND_ID_SELECTION = 'mikaeljorhult.bracketsAutoprefixer.selection',
		COMMAND_ID_SETTINGS = 'mikaeljorhult.bracketsAutoprefixer.settings',
		preferences = null,
		defaultPreferences = {
			enabled: false
		},
		processed = false,
		
		// Hook into menus.
		menu = Menus.getMenu( Menus.AppMenuBar.EDIT_MENU );
	
	/** 
	 * Set state of extension.
	 */
	function toggleAutoprefixer() {
		var enabled = preferences.getValue( 'enabled' );
		
		enableAutoprefixer( !enabled );
	}
	
	/** 
	 * Initialize extension.
	 */
	function enableAutoprefixer( enabled ) {
		// Save enabled state.
		preferences.setValue( 'enabled', enabled );
		
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
				editor.document.replaceRange( processedText.css, currentSelection.start, currentSelection.end );
			}
		}
	}
	
	/**
	 * Process text using Autoprefixer.
	 */
	function process( originalText ) {
		var processedText = false;
		
		// Return false if not able to process.
		try {
			processedText = autoprefixer.process( originalText ).css;
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
	
	// Initialize PreferenceStorage.
	preferences = PreferencesManager.getPreferenceStorage( module, defaultPreferences );
	
	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		var $documentManager = $( DocumentManager );
		
		// Process document when saved.
		$documentManager.on( 'documentSaved.autoprefixer', function( event, document ) {
			// Bail if extension's not enabled.
			if ( !preferences.getValue( 'enabled' ) ) {
				return;
			}
			
			// Only check CSS documents.
			if ( document === DocumentManager.getCurrentDocument() && document.language.getName() === 'CSS' ) {
				run();
			}
		} );
		
		// Enable extension if loaded last time.
		if ( preferences.getValue( 'enabled' ) ) {
			enableAutoprefixer( true );
		}
	} );
} );