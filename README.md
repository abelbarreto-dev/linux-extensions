# Linux Extensions
Here is my extensions repository. My customizations are here.

Note: I build these extensions with AI use. My opperation system is a Debian. My environment is Cinnamon.

## Summary
1. [Project Structue](#project-structure)
2. [Decription](#description)
3. [How to Install](#how-to-install)  
4. [Display](#display)
5. [Notes](#notes)
6. [Credits](#credits)

## Project Structure
```text
applets/
|---macos-menu@gmail.local/
docs/
|---<document_name>.md
extensions/
|---macos-cinnamon-menu@abel.local/
screenshots/
|---screenshot-<number_name>.png
scripts/
|---extractor-double-click@abel.local
```

## Description
* `applets/:` Where I put the items like Menu.
* `docs/:` The documents you can use to understant this project.
* `extensions/:` System customizations.
* `screenshots/:` The screenshots of project working.
* `scripts/:` Useful scripts to implement to your system.

## How to Install
**Steps for Applets:**
```commandline
cp -r <applet_name>@abel.local ~/.local/share/cinnamon/applets
```
* Activate using your _Applet Manager_ software at your panel.

**Steps for Extensions:**
```commandline
cp -r <extension_name>@abel.local ~/.local/share/cinnamon/extensions
```
* Activate using your _Extension Manager_ software.
* If you prefer, you can just using the key map: `Alt + F2` then type `r` and Enter.

**Steps for Scripts:**
Each script has its own documentation. I present a list containing the documentation and script folder.
* `scripts/extractor-double-click@abel.local/`
  * Documentation [here](./scripts/extractor-double-click@abel.local/README.md).

## Display
Here is an example of what you can expect:

* Global Menu [here](/extensions/macos-cinnamon-menu@abel.local/).
![ScreenshotOne-Desktop-View](/screenshots/screenshot-two.png)
![ScreenshotOne-VS-CodeView](/screenshots/screenshot-one.png)

* Extractor Double Click [here](/scripts/extractor-double-click@abel.local/).
![Extracting file with double click - one](/scripts/extractor-double-click@abel.local/screenshots/extractor-double-click@abel.local.one.gif)

## Notes
* These work is not perfect, as well as you can find some issues. I'm working to make fixes.
* You can contributing opening a pull request.
* This projects is under the [MIT Licence](/LICENSE), so you can edit it by yourself.

## Credits
Here is the credits about external source I've used to build that project.
* [Apple Logo](https://www.svgrepo.com/svg/503173/apple-logo)

---
_That's All Folks!_
