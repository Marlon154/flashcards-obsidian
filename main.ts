import { addIcon, Notice, Plugin, TagCache, TFile } from 'obsidian';
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

		// TODO test when file did not insert flashcards, but one of them is in Anki already
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
			name: 'Generate for files with tag',
			checkCallback: (checking: boolean) => {
				if (!checking) {
					this.generateCardsForTag();
				}
				return true;
			}
		});

		this.addRibbonIcon('flashcards', 'Generate flashcards', () => {
			const activeFile = this.app.workspace.getActiveFile()
			if (activeFile) {
				this.generateCards(activeFile)
			} else {
				new Notice("Open a file before")
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
		return { contextAwareMode: true, sourceSupport: false, codeHighlightSupport: false, inlineID: false, contextSeparator: " > ", deck: "Default", folderBasedDeck: true, flashcardsTag: "card", inlineSeparator: "::", inlineSeparatorReverse: ":::", defaultAnkiTag: "obsidian", ankiConnectPermission: false }
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

	private async generateCardsForTag() {
		if (this.syncInProgress) {
			return;
		}
		this.syncInProgress = true;
		new Notice("Start complete Anki sync", noticeTimeout)
		const flashcardsTag = "#" + (this.settings.flashcardsTag as string); 
		const filesWithTag = this.app.vault.getFiles().filter(file => {
			const fileTags = this.app.metadataCache.getFileCache(file)?.tags || [];
			const tagStrings = fileTags.map(tag => tag.tag);
			
            return tagStrings.includes(flashcardsTag);
		});

		let noteNumber = 1;

		for (const file of filesWithTag) {
			try {
				const res = await this.cardsService.execute(file);
				new Notice(`Note ${noteNumber++} of ${filesWithTag.length}: \n${res.join('\n')}`, noticeTimeout);
				console.log(res);
			} catch (err) {
				Error(err);
			}
		}

		this.syncInProgress = false;
		new Notice("Finished complete Anki sync", noticeTimeout)
	}
	
}