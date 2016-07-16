define( function( require, exports ) {
	'use strict';
	
	// Get module dependencies.
	var Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		TemplateEngine = brackets.getModule( 'thirdparty/mustache/mustache' ),
		
		// Extension modules.
		Preferences = require( 'modules/Preferences' ),
		Strings = require( 'modules/Strings' ),
		
		// Templates.
		settingsDialogTemplate = require( 'text!../html/settings-dialog.html' ),
		settingsDialogBrowser = require( 'text!../html/settings-browser.html' ),
		
		// Variables.
		dialog,
		$dialog;

	/**
	 * Reset all preferences to defaults.
	 */
	function resetValues() {
		Preferences.set( 'visualCascade', false );
		Preferences.set( 'browsers', Preferences.defaults.browsers );

		init();
	}
	
	/**
	 * Set each value of the preferences in dialog.
	 */
	function setValues( values ) {
		$( '#autoprefixer-settings-visualCascade' ).prop( 'checked', values.visualCascade );
		
		$dialog.find( '#autoprefixer-settings-browsers' ).html( TemplateEngine.render( settingsDialogBrowser, {
			browsers: Preferences.get( 'browsers' )
		} ) );
	}
	
	/**
	 * Initialize dialog values.
	 */
	function init() {
		var values = {},
			properties = [ 'visualCascade' ];
		
		$.each( properties, function( index, value ) {
			values[ value ] = Preferences.get( value );
		} );
		
		setValues( values );
	}
	
	/**
	 * Exposed method to show dialog.
	 */
	exports.show = function() {
		// Compile dialog template.
		var compiledTemplate = TemplateEngine.render( settingsDialogTemplate, {
			Strings: Strings,
			browsers: Preferences.get( 'browsers' )
		}, { browsers: settingsDialogBrowser } );
		
		// Save dialog to variable.
		dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
		$dialog = dialog.getElement();
		
		// Initialize dialog values.
		init();
		
		// Register event listeners.
		$dialog
			.on( 'click', '.reset-preferences', function() {
				resetValues();
			} )
			.on( 'click', '.remove-browser', function() {
				$( this ).parents( 'tr.browser' ).remove();
			} )
			.on( 'click', '.add-browser', function() {
				var $table = $( '#autoprefixer-settings-browsers' );
				
				// Compile empty table row and set focus in text input.
				$table
					.append( TemplateEngine.render( settingsDialogBrowser, {
						browsers: [ ' ' ]
					} ) )
					.find( 'input[ type="text" ]' ).last().val( '' ).focus();
			} );
		
		// Open dialog.
		dialog.done( function( buttonId ) {
			// Save preferences if OK button was clicked.
			if ( buttonId === 'ok' ) {
				var browsers = $( '#autoprefixer-settings-browsers input[ type="text" ]', $dialog ).map( function() {
						// Get value of each text input.
						var value = $.trim( $( this ).val() );
						
						// Only add it to array if non-empty.
						if ( value.length > 0 ) {
							return value;
						}
					} ).get();
				
				// Save each preference.
				Preferences.set( 'visualCascade', $( '#autoprefixer-settings-visualCascade', $dialog ).prop( 'checked' ) );
				Preferences.set( 'browsers', browsers );

				Preferences.save();
			}
		} );
	};
} );