define(function () {
  'use strict';

  // Get dependencies.
  var LanguageManager = brackets.getModule('language/LanguageManager');
  var ProjectManager = brackets.getModule('project/ProjectManager');

  // Variables.
  var projectRoot;

  /**
   * Return path to current project root.
   */
  function getProjectRoot () {
    projectRoot = projectRoot || ProjectManager.getProjectRoot().fullPath;

    return projectRoot;
  }

  /**
   * Check if file is located in project root.
   */
  function isFileInProjectRoot (file) {
    return (file !== null && file.isFile === true && file.fullPath.indexOf(getProjectRoot()) > -1);
  }

  /**
   * Check if file is of specified types.
   */
  function isFileType (file, types) {
    var type = file.constructor.name.toLowerCase();
    var path;

    // Check type of object and get file path.
    if (type === 'file') {
      path = file.fullPath;
    } else if (type === 'document') {
      path = file.file.fullPath;
    }

    return types.indexOf(LanguageManager.getLanguageForPath(path).getId()) > -1;
  }

  /**
   * Make a full path relative to project root.
   */
  function makeRelative (path) {
    return path.replace(getProjectRoot(), '');
  }

  // Reload settings when new project is loaded.
  ProjectManager.on('projectOpen', function () {
    projectRoot = ProjectManager.getProjectRoot().fullPath;
  });

  // Return module.
  return {
    isFileInProjectRoot: isFileInProjectRoot,
    isFileType: isFileType,
    makeRelative: makeRelative,
    projectRoot: getProjectRoot
  };
});
