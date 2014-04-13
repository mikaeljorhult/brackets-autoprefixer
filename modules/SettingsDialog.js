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
	
	/**
	 * Set each value of the preferences in dialog.
	 */
	function setValues( values ) {
		$( '#autoprefixer-settings-visualCascade' ).prop( 'checked', values.visualCascade );
	}
	
	/**
	 * Initialize dialog values.
	 */
	function init() {
		var values = {},
			properties = [ 'visualCascade' ];
		
		$.each( properties, function( index, value ) {
			values[ value ] = preferences.get( value );
		} );
		
		setValues( values );
	}
	
	/**
	 * Exposed method to show dialog.
	 */
	exports.show = function( prefs ) {
		// Compile dialog template.
		var compiledTemplate = Mustache.render( settingsDialogTemplate, {
			Strings: Strings,
			browsers: prefs.get( 'browsers' )
		} );
		
		// Save dialog to variable.
		dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
		preferences = prefs;
		
		// Initialize dialog values.
		init();
		
		// Open dialog.
		dialog.done( function( buttonId ) {
			// Save preferences if OK button was clicked.
			if ( buttonId === 'ok' ) {
				var $dialog = dialog.getElement(),
					browsers = $( '#autoprefixer-settings-browsers input', $dialog ).map( function() {
						// Get value of each text input.
						var value = $.trim( $( this ).val() );
						
						// Only add it to array if non-empty.
						if ( value.length > 0 ) {
							return value;
						}
					} ).get();
				
				// Save each preference.
				preferences.set( 'visualCascade', $( '#autoprefixer-settings-visualCascade', $dialog ).prop( 'checked' ) );
				preferences.set( 'browsers', browsers );
				
				preferences.save();
			}
		} );
	};
} );