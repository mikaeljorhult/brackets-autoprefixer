# Brackets Autoprefixer

Brackets/Edge Code extension that parses CSS documents and add vendor prefixes automatically.

This extension uses [autoprefixer](https://github.com/ai/autoprefixer), a tool that parses your CSS and
add/remove vendor prefixes where appropriate according to data from [Can I Use](http://caniuse.com/).
This means that you can write you CSS without having to worry about which vendor prefixes you have to include.
As soon as you save your file this will be done for you.

## Installation
You may download and install this extension in one of three ways. Using Extension Manager to find it through 
the extension registry you always find the latest stable release conveniently within Brackets.

You can also get the latest work-in-progress version by downloading or installing the extension directly 
from the repository. This allows you to try new features that might not have been tested properly yet.

### Install using Extension Manager

1. Open the the Extension Manager from the File menu.
2. Click the Available tab i upper left corner.
3. Find Autoprefixer in list of extensions (use the search field to filter the list).
4. Click Install.

### Install from URL

1. Open the the Extension Manager from the File menu.
2. Click on Install form URL...
3. Copy and paste following URL in the text field: `https://github.com/mikaeljorhult/brackets-autoprefixer`
4. Click Install.

### Install from file system

1. Download this extension using the ZIP button and unzip it.
2. Copy it in Brackets' `/extensions/user` folder by selecting Show Extension Folder in the Help menu. 
3. Reload Brackets.


## Usage

Go to the Edit menu and enable the extension by clicking on the Autoprefixer command. Autoprefixer will parse 
the code whenever a CSS document is saved and add and/or remove vendor prefixes where appropriate.