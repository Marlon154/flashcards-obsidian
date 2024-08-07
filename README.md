This [fork of the original repo](https://github.com/reuseman/flashcards-obsidian/) adds bulk sync for all files and only modified files with the hashtag. Since the original repo is not maintained any more.
---

# Flashcards
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/reuseman/flashcards-obsidian?style=for-the-badge&sort=semver)](https://github.com/reuseman/flashcards-obsidian/releases/latest)
![GitHub All Releases](https://img.shields.io/github/downloads/reuseman/flashcards-obsidian/total?style=for-the-badge)
![logo](logo.png)

Anki integration for [Obsidian](https://obsidian.md/).

## Features
🗃️ Simple flashcards with **#card**  
🎴 Reversed flashcards with **#card-reverse** or **#card/reverse**  
📅 Spaced-only cards with **#card-spaced** or **#card/spaced**  
✍️ Inline style with **Question::Answer**  
✍️ Inline style reversed with **Question:::Answer**  
📃 Cloze with **==Highlight==** or **{Curly brackets}** or  **{2:Cloze}**   
🧠 **Context-aware** mode  
🏷️ Global and local **tags**  
🔢 Support for **LaTeX**  
🖼️ Support for **images**  
🎤 Support for **audios**   
🔗 Support for **Obsidian URI**  
⚓ Support for **reference to note**  
📟 Support for **code syntax highlight**  
🔄 **Bulk sync** for all files with the flashcard tag  
⏱️ **Smart sync** that only processes modified files since last sync  
🔘 Configurable **ribbon icon action** for quick syncing

For other features check the [wiki](https://github.com/reuseman/flashcards-obsidian/wiki).

## How it works?
The following is a demo where the three main operations are shown:
1. **Insertion** of cards;
2. **Update** of cards;
3. **Deletion** of cards.

![Demo image](docs/demo.gif)

## How to use it?
The wiki explains in detail [how to use it](https://github.com/reuseman/flashcards-obsidian/wiki).

## How to install
1. [Install](obsidian://show-plugin?id=flashcards-obsidian) this plugin on Obsidian:
   - Open Settings > Community plugins
   - Make sure Safe mode is off
   - Click Browse community plugins
   - Search for "**Flashcards**"
   - Click Install
   - Once installed, close the community plugins window and activate the newly installed plugin
2. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) on Anki
   - Tools > Add-ons -> Get Add-ons...
   - Paste the code **2055492159** > Ok
3. Open the settings of the plugin, and while Anki is opened press "**Grant Permission**"

## New Features
- **Bulk Sync**: Sync all files with the flashcard tag in one go.
- **Smart Sync**: Only process files that have been modified since the last sync, improving performance for large vaults.
- **Configurable Ribbon Icon**: Choose whether the ribbon icon should sync the current file, modified files, or all files.
- **Force Sync Option**: Manually trigger a sync of all files, regardless of their modification time.
- **Last Sync Time**: View and reset the last sync time in the plugin settings.

## Contributing
Contributions via bug reports, bug fixes, are welcome. If you have ideas about features to be implemented, please open an issue so we can discuss the best way to implement it. For more details check [Contributing.md](docs/CONTRIBUTING.md)

## Support
If flashcards plugin is useful to you and you want to support me, you can thank me with a coffee :)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V0ABKAF)
