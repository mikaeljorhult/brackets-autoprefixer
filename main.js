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
		EditorManager = brackets.getModule( 'editor/EditorManager' ),
		AppInit = brackets.getModule( 'utils/AppInit' ),

		// Get extension modules.
        AutoprefixOnSave = require( 'modules/AutoprefixOnSave' ),
        AutoprefixSelection = require( 'modules/AutoprefixSelection' ),
		Preferences = require( 'modules/Preferences' ),
		Processor = require( 'modules/Processor' ),
		Strings = require( 'modules/Strings' ),
		SettingsDialog = require( 'modules/SettingsDialog' ),

		// Setup extension.
		COMMAND_ID_AUTOSAVE = 'mikaeljorhult.bracketsAutoprefixer.enable',
		COMMAND_ID_SELECTION = 'mikaeljorhult.bracketsAutoprefixer.selection',
		COMMAND_ID_SETTINGS = 'mikaeljorhult.bracketsAutoprefixer.settings',

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

	// Register extension.
	CommandManager.register( Strings.MENU_ON_SAVE, COMMAND_ID_AUTOSAVE, toggleAutoprefixer );
	CommandManager.register( Strings.MENU_SELECTION, COMMAND_ID_SELECTION, AutoprefixSelection.process );
	CommandManager.register( Strings.MENU_SETTINGS, COMMAND_ID_SETTINGS, SettingsDialog.show );

	// Add command to menu.
	menu.addMenuDivider();
	menu.addMenuItem( COMMAND_ID_AUTOSAVE );
	menu.addMenuItem( COMMAND_ID_SELECTION );
	menu.addMenuItem( COMMAND_ID_SETTINGS );

	// Register panel and setup event listeners.
	AppInit.appReady( function() {
		// Enable extension if loaded last time.
		if ( Preferences.get( 'enabled' ) ) {
			enableAutoprefixer( true );
		}
	} );
} );