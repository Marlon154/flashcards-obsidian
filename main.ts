import { addIcon, Notice, Plugin, TFile } from 'obsidian';
import { ISettings } from 'src/conf/settings';
import { SettingsTab } from 'src/gui/settings-tab';
import { CardsService } from 'src/services/cards';
import { Anki } from 'src/services/anki';
import { noticeTimeout, flashcardsIcon } from 'src/conf/constants';

export default class ObsidianFlashcard extends Plugin {
  private settings: ISettings
  private cardsService: CardsService
  private syncInProgress: boolean = false;

  async onload() {
    addIcon("flashcards", flashcardsIcon)

    const anki = new Anki()
    this.settings = await this.loadData() || this.getDefaultSettings()
    this.cardsService = new CardsService(this.app, this.settings)

    const statusBar = this.addStatusBarItem()

    this.addCommand({
      id: 'generate-flashcard-current-file',
      name: 'Generate for the current file',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile()
        if (activeFile) {
          if (!checking) {
            this.generateCards(activeFile)
          }
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: 'generate-flashcards-for-tag',
      name: 'Sync modified flashcards',
      callback: () => this.generateCardsForTag(false)
    });

    this.addCommand({
      id: 'force-sync-flashcards',
      name: 'Force sync all flashcards',
      callback: () => this.generateCardsForTag(true)
    });

	this.addRibbonIcon('flashcards', 'Generate flashcards', () => {
	  switch (this.settings.ribbonIconAction) {
		case 'current':
		  const activeFile = this.app.workspace.getActiveFile();
		  if (activeFile) {
		    this.generateCards(activeFile);
		  } else {
		    new Notice("Open a file before generating flashcards for the current file");
		  }
		  break;
		case 'modified':
		  this.generateCardsForTag(false);
		  break;
		case 'all':
		  this.generateCardsForTag(true);
		  break;
	  }
	});

    this.addSettingTab(new SettingsTab(this.app, this));

    this.registerInterval(window.setInterval(() =>
      anki.ping().then(() => statusBar.setText('Anki ⚡️')).catch(() => statusBar.setText('')), 15 * 1000
    ));
  }

  async onunload() {
    await this.saveData(this.settings);
  }

  private getDefaultSettings(): ISettings {
    return {
      contextAwareMode: true,
      sourceSupport: false,
      codeHighlightSupport: false,
      inlineID: false,
      contextSeparator: " > ",
      deck: "Default",
      folderBasedDeck: true,
      flashcardsTag: "card",
      inlineSeparator: "::",
      inlineSeparatorReverse: ":::",
      defaultAnkiTag: "obsidian",
      ankiConnectPermission: false,
      lastSyncTimestamp: 0,
      ribbonIconAction: "current"
    }
  }

  private async generateCards(activeFile: TFile) {
    await this.cardsService.execute(activeFile).then(res => {
      for (const r of res) {
        new Notice(r, noticeTimeout)
      }
      console.log(res)
    }).catch(err => {
      Error(err)
    })
  }

  private padMessage(message: string): string {
    const maxLength = 100;
    const lines = message.split('\n');
    return lines.map(line => line.padEnd(maxLength)).join('\n');
  }

  private async generateCardsForTag(forceSync: boolean = false) {
    if (this.syncInProgress) {
      return;
    }
    this.syncInProgress = true;

    const flashcardsTag = "#" + (this.settings.flashcardsTag as string);
    const filesWithTag = this.app.vault.getFiles().filter(file => {
      const fileTags = this.app.metadataCache.getFileCache(file)?.tags || [];
      const tagStrings = fileTags.map(tag => tag.tag);
      return tagStrings.includes(flashcardsTag) && 
             (forceSync || file.stat.mtime > this.settings.lastSyncTimestamp);
    });

    let noteNumber = 1;
    const totalNotes = filesWithTag.length;
    let syncNotice = new Notice(this.padMessage(`Syncing Anki cards: 0/${totalNotes}`), 0);

    let totalUpdated = 0;
    let totalAdded = 0;
    let totalRemoved = 0;
    let errors: string[] = [];

    for (const file of filesWithTag) {
      try {
        const res = await this.cardsService.execute(file);
        const progressMessage = `Syncing Anki cards: ${noteNumber}/${totalNotes}\nLast synced: ${file.name}`;
        syncNotice.setMessage(this.padMessage(progressMessage));
        console.log(res);

        res.forEach(message => {
          if (message.includes("Updated successfully")) {
            const match = message.match(/Updated successfully (\d+)\/(\d+) cards/);
            if (match) {
              totalUpdated += parseInt(match[1]);
            }
          } else if (message.includes("Inserted successfully")) {
            const match = message.match(/Inserted successfully (\d+)\/(\d+) cards/);
            if (match) {
              totalAdded += parseInt(match[1]);
            }
          } else if (message.includes("Deleted successfully")) {
            const match = message.match(/Deleted successfully (\d+)\/(\d+) cards/);
            if (match) {
              totalRemoved += parseInt(match[1]);
            }
          } else if (message.startsWith("Error:")) {
            errors.push(`${file.name}: ${message}`);
          }
        });

        noteNumber++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push(`${file.name}: ${errorMessage}`);
      }
    }

    this.syncInProgress = false;
    let finalMessage = `Finished Anki sync: ${totalNotes} notes processed\n` +
                       `Updated: ${totalUpdated}\n` +
                       `Added: ${totalAdded}\n` +
                       `Removed: ${totalRemoved}`;
    
    if (errors.length > 0) {
      finalMessage += `\n\nErrors occurred in ${errors.length} files:`;
      errors.forEach((error, index) => {
        finalMessage += `\n${index + 1}. ${error}`;
      });
    }

    syncNotice.setMessage(finalMessage);
    console.log(finalMessage);
    setTimeout(() => syncNotice.hide(), 12000);

    // Update last sync timestamp
    await this.updateLastSyncTimestamp();
  }

  private async updateLastSyncTimestamp() {
    this.settings.lastSyncTimestamp = Date.now();
    await this.saveData(this.settings);
  }
}

