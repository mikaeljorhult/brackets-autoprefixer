define(function (require) {
  'use strict';

  // Get module dependencies.
  var EditorManager = brackets.getModule('editor/EditorManager');

  // Get extension modules.
  var Processor = require('modules/Processor');

  /**
   * Process current selection.
   */
  function process () {
    var editor = EditorManager.getCurrentFullEditor();
    var currentSelection;
    var originalText;
    var processedText;

    // Only proceed if there is a selection.
    if (editor.hasSelection()) {
      // Get position and text of selection.
      currentSelection = editor.getSelection();
      originalText = editor.getSelectedText();
      processedText = Processor.process(originalText);

      if (processedText !== false) {
        // Replace selected text with processed text.
        editor.document.replaceRange(processedText, currentSelection.start, currentSelection.end);
      }
    }
  }

  // Return object with default values.
  return {
    process: process
  };
});
