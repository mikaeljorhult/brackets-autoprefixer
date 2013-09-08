/*!
 * Brackets Autoprefixer 0.1.2
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
		Editor = brackets.getModule( 'editor/Editor' ).Editor,
		DocumentManager = brackets.getModule( 'document/DocumentManager' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),
		autoprefixer = require( 'vendor/autoprefixer/autoprefixer' );
	
	// Setup extension.
	var COMMAND_ID = 'mikaeljorhult.bracketsAutoprefixer.enable',
		MENU_NAME = 'Autoprefixer',
		preferences = null,
		defaultPreferences = {
			enabled: false
		},
		processed = false;
	
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
		if ( preferences.getValue( 'enabled' ) && !processed ) {
			var editor = EditorManager.getCurrentFullEditor(),
				currentDocument = editor.document,
				originalText = currentDocument.getText(),
				processedText = autoprefixer.compile( originalText ),
				cursorPos = editor.getCursorPos(),
				scrollPos = editor.getScrollPos();
			
			// Replace text.
			currentDocument.setText( formatCode( processedText ) );
			
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
	
	function formatCode( text ) {
		var useTabs = Editor.getUseTabChar(),
			char,
			size,
			replaceString = '';
		
		// Set replacing string to use spaces or tabs.
		if ( useTabs ) {
			char = '\t';
			size = 1;
		} else {
			char = ' ';
			size = Editor.getSpaceUnits();
		}
		
		// Create string to replace with.
		for ( var i = 0; i < size; i++ ) {
			replaceString += char;
		}
		
		// Replace any leading whitespace with "correct" indentation.
		return text.replace( /^\s+/gm, replaceString );
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