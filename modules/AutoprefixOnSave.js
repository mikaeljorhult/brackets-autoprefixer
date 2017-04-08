define(function (require) {
  'use strict';

  // Get module dependencies.
  var AppInit = brackets.getModule('utils/AppInit');
  var CommandManager = brackets.getModule('command/CommandManager');
  var Commands = brackets.getModule('command/Commands');
  var DocumentManager = brackets.getModule('document/DocumentManager');
  var EditorManager = brackets.getModule('editor/EditorManager');

  // Get extension modules.
  var Paths = require('modules/Paths');
  var Preferences = require('modules/Preferences');
  var Processor = require('modules/Processor');

  // Set variables.
  var processed = false;

  /**
   * Process whole current file.
   */
  function process () {
    if (!processed) {
      var editor = EditorManager.getCurrentFullEditor();
      var currentDocument = editor.document;
      var originalText = currentDocument.getText();
      var processedText = Processor.process(originalText);
      var cursorPos = editor.getCursorPos();
      var scrollPos = editor.getScrollPos();

      // Bail if processing was unsuccessful.
      if (processedText === false) {
        return;
      }

      // Replace text.
      currentDocument.setText(processedText);

      // Restore cursor and scroll positons.
      editor.setCursorPos(cursorPos);
      editor.setScrollPos(scrollPos.x, scrollPos.y);

      // Save file.
      CommandManager.execute(Commands.FILE_SAVE);

      // Prevent file from being processed multiple times.
      processed = true;
    } else {
      processed = false;
    }
  }

  /**
   * Setup listeners when App is ready.
   */
  AppInit.appReady(function () {
    // Process document when saved.
    DocumentManager.on('documentSaved.autoprefixer', function (event, document) {
      // Bail if extension's not enabled.
      if (!Preferences.get('enabled')) {
        return;
      }

      // Only check CSS documents.
      if (document === DocumentManager.getCurrentDocument() && Paths.isFileType(document, ['css'])) {
        process();
      }
    });
  });

  // Return object with default values.
  return {
    process: process
  };
});
