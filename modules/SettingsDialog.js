define( function( require, exports ) {
	'use strict';
	
	// Get module dependencies.
	var Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		
		// Extension modules.
		Strings = require( 'modules/Strings' ),
		settingsDialogTemplate = require( 'text!../html/settings-dialog.html' ),
		
		// Variables.
		dialog,
		preferences;

	function setValues( values ) {
		$( '#git-settings-stripWhitespaceFromCommits' ).prop( 'checked', values.stripWhitespaceFromCommits );
	}

	function restorePlatformDefaults() {
		setValues( DefaultPreferences );
	}

	function init() {
		setValues( preferences.getAllValues() );
		assignActions();

		if (brackets.platform !== 'win' ) {
			$( '.windows_only' ).hide();
		}
	}

	exports.show = function( prefs ) {
		var compiledTemplate = Mustache.render( settingsDialogTemplate, {
			Strings: Strings
		} );

		dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
		preferences = prefs;

		init();

		dialog.done( function( buttonId ) {
			if ( buttonId === 'ok' ) {
				var $dialog = dialog.getElement();
				// features
				preferences.setValue( 'stripWhitespaceFromCommits', $( '#git-settings-stripWhitespaceFromCommits', $dialog).prop( 'checked' ));
			}
		});
	};
});