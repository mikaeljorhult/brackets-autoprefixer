/*!
 * Brackets Autoprefixer 0.7.5
 * Parse CSS and add vendor prefixes automatically.
 *
 * @author Mikael Jorhult
 * @license http://mikaeljorhult.mit-license.org MIT
 */
define(function (require) {
  'use strict';

  // Get module dependencies.
  var Menus = brackets.getModule('command/Menus');
  var CommandManager = brackets.getModule('command/CommandManager');
  var AppInit = brackets.getModule('utils/AppInit');

  // Get extension modules.
  require('modules/AutoprefixOnChange');
  require('modules/AutoprefixOnSave');
  var AutoprefixSelection = require('modules/AutoprefixSelection');
  var Preferences = require('modules/Preferences');
  var Strings = require('modules/Strings');
  var SettingsDialog = require('modules/SettingsDialog');

  // Setup extension.
  var COMMAND_ID_ONSAVE = 'mikaeljorhult.bracketsAutoprefixer.onsave';
  var COMMAND_ID_ONCHANGE = 'mikaeljorhult.bracketsAutoprefixer.onchange';
  var COMMAND_ID_SELECTION = 'mikaeljorhult.bracketsAutoprefixer.selection';
  var COMMAND_ID_SETTINGS = 'mikaeljorhult.bracketsAutoprefixer.settings';

  // Hook into menus.
  var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

  /**
   * Set state of extension.
   */
  function toggleOnSave () {
    var enabled = Preferences.get('enabled');
    enableOnSave(!enabled);
  }

  /**
   * Initialize extension.
   */
  function enableOnSave (enabled) {
    // Save enabled state.
    Preferences.set('enabled', enabled);

    // Mark menu item as enabled/disabled.
    CommandManager.get(COMMAND_ID_ONSAVE).setChecked(enabled);
  }

  /**
   * Set state of extension.
   */
  function toggleOnChange () {
    var state = Preferences.get('onChange');
    enableOnChange(!state);
  }

  /**
   * Initialize extension.
   */
  function enableOnChange (state) {
    // Save enabled state.
    Preferences.set('onChange', state);

    // Mark menu item as enabled/disabled.
    CommandManager.get(COMMAND_ID_ONCHANGE).setChecked(state);
  }

  // Register extension.
  CommandManager.register(Strings.MENU_ON_SAVE, COMMAND_ID_ONSAVE, toggleOnSave);
  CommandManager.register(Strings.MENU_ON_CHANGE, COMMAND_ID_ONCHANGE, toggleOnChange);
  CommandManager.register(Strings.MENU_SELECTION, COMMAND_ID_SELECTION, AutoprefixSelection.process);
  CommandManager.register(Strings.MENU_SETTINGS, COMMAND_ID_SETTINGS, SettingsDialog.show);

  // Add command to menu.
  menu.addMenuDivider();
  menu.addMenuItem(COMMAND_ID_ONSAVE);
  menu.addMenuItem(COMMAND_ID_ONCHANGE);
  menu.addMenuItem(COMMAND_ID_SELECTION, 'Ctrl-Shift-P');
  menu.addMenuItem(COMMAND_ID_SETTINGS);

  // Enable functions.
  AppInit.appReady(function () {
    if (Preferences.get('enabled')) {
      enableOnSave(true);
    }

    if (Preferences.get('onChange')) {
      enableOnChange(true);
    }
  });
});
