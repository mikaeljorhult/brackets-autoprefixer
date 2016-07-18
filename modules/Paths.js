define( function() {
    'use strict';

    // Get dependencies.
    var ProjectManager = brackets.getModule( 'project/ProjectManager' ),

        // Variables.
        projectRoot;

    /**
     * Return path to current project root.
     */
    function getProjectRoot() {
        projectRoot = projectRoot || ProjectManager.getProjectRoot().fullPath;

        return projectRoot;
    }

    /**
     * Check if file is located in project root.
     */
    function isFileInProjectRoot( file ) {
        return ( file !== null && file.isFile === true && file.fullPath.indexOf( getProjectRoot() ) > -1 );
    }

    /**
     * Make a full path relative to project root.
     */
    function makeRelative( path ) {
        return path.replace( getProjectRoot(), '' );
    }

    // Reload settings when new project is loaded.
    ProjectManager.on( 'projectOpen', function() {
        projectRoot = ProjectManager.getProjectRoot().fullPath;
    } );

    // Return module.
    return {
        isFileInProjectRoot: isFileInProjectRoot,
        makeRelative: makeRelative,
        projectRoot: getProjectRoot
    };
} );