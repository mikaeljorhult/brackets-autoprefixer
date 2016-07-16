define( function( require, exports ) {
	'use strict';
	
	// Get module dependencies.
	var Dialogs = brackets.getModule( 'widgets/Dialogs' ),
		TemplateEngine = brackets.getModule( 'thirdparty/mustache/mustache' ),
		
		// Extension modules.
		Defaults = require( 'modules/Defaults' ),
		Strings = require( 'modules/Strings' ),
		
		// Templates.
		settingsDialogTemplate = require( 'text!../html/settings-dialog.html' ),
		settingsDialogBrowser = require( 'text!../html/settings-browser.html' ),
		
		// Variables.
		dialog,
		$dialog,
		preferences;

	/**
	 * Reset all preferences to defaults.
	 */
	function resetValues() {
		preferences.set( 'visualCascade', false );
		preferences.set( 'browsers', Defaults.browsers );
		preferences.save();
		
		init();
	}
	
	/**
	 * Set each value of the preferences in dialog.
	 */
	function setValues( values ) {
		$( '#autoprefixer-settings-visualCascade' ).prop( 'checked', values.visualCascade );
		
		$dialog.find( '#autoprefixer-settings-browsers' ).html( TemplateEngine.render( settingsDialogBrowser, {
			browsers: preferences.get( 'browsers' )
		} ) );
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
		var compiledTemplate = TemplateEngine.render( settingsDialogTemplate, {
			Strings: Strings,
			browsers: prefs.get( 'browsers' )
		}, { browsers: settingsDialogBrowser } );
		
		// Save dialog to variable.
		dialog = Dialogs.showModalDialogUsingTemplate( compiledTemplate );
		$dialog = dialog.getElement();
		preferences = prefs;
		
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
				preferences.set( 'visualCascade', $( '#autoprefixer-settings-visualCascade', $dialog ).prop( 'checked' ) );
				preferences.set( 'browsers', browsers );
				
				preferences.save();
			}
		} );
	};
} );