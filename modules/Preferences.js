define( function( require ) {
    'use strict';

    var PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
        Defaults = require( 'modules/Defaults' ),
        preferences = PreferencesManager.getExtensionPrefs( 'mikaeljorhult.bracketsAutoprefixer' );

    // Define preferences.
    preferences.definePreference( 'enabled', 'boolean', false );
    preferences.definePreference( 'onChange', 'boolean', false );
    preferences.definePreference( 'visualCascade', 'boolean', false );
    preferences.definePreference( 'browsers', 'array', Defaults.browsers );

    /**
     * Get value of preference.
     */
    function get( property ) {
        return preferences.get( property );
    }

    /**
     * Set value of preference.
     */
    function set( property, value ) {
        return preferences.set( property, value );
    }

    /**
     * Save preferences.
     */
    function save() {
        return preferences.save();
    }

    // Return module object.
    return {
        defaults: Defaults,
        get: get,
        set: set,
        save: save
    };
} );