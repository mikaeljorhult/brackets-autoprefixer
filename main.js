/*!
 * Brackets Autoprefixer 0.1.0
 * 
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
		autoprefixer = require( 'thirdparty/autoprefixer' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsAutoprefixer.enable',
		MENU_NAME = 'Autoprefixer',
		preferences = null,
		defaultPreferences = {
			enabled: false
		};
	
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
		CommandManager.get( COMMAND_ID ).setChecked( enabled );
	}
	
	/**
	 * Main functionality: Find and show comments.
	 */
	function run() {
		if ( preferences.getValue( 'enabled' ) ) {
			var editor = EditorManager.getCurrentFullEditor(),
				currentDocument = editor.document,
				originalText = currentDocument.getText(),
				processedText = autoprefixer.compile( originalText ),
				cursorPos = editor.getCursorPos(),
				scrollPos = editor.getScrollPos();
			
			// Replace text.
			currentDocument.setText( processedText );
			
			// Restore cursor and scroll positons.
			editor.setCursorPos( cursorPos );
			editor.setScrollPos( scrollPos.x, scrollPos.y );
		}
	}
	
	// Register extension.
	CommandManager.register( MENU_NAME, COMMAND_ID, toggleAutoprefixer );
	
	// Add command to menu.
	var menu = Menus.getMenu( Menus.AppMenuBar.EDIT_MENU );
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID );
	
	// Initialize PreferenceStorage.
	preferences = PreferencesManager.getPreferenceStorage( module, defaultPreferences );
	
	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		var $documentManager = $( DocumentManager );
		
		// Process document when saved.
		$documentManager.on( 'documentSaved.autoprefixer', function( event, document ) {
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