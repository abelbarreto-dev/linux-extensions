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
```

## Description
* applets/: Where I put the items like Menu.
* docs/: The documents you can use to understant this project.
* extensions/: System customizations.
* screenshots/: The screenshots of project working.

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

## Display
Here is an example of what you can expect:

![ScreenshotOne-VS-CodeView](/screenshots/screenshot-one.png)

## Notes
* These work is not perfect, as well as you can find some issues. I'm working to make fixes.
* You can contributing opening a pull request.
* This projects is under the [MIT Licence](/LICENSE), so you can edit it by yourself.

## Credits
Here is the credits about external source I've used to build that project.
* [Apple Logo](https://www.svgrepo.com/svg/503173/apple-logo)

---
_That's All Folks!_
