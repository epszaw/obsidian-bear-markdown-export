import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { readNotes } from "./utils";
import { join } from "path";

interface BearMDExportPluginSettings {
  exportPath: string;
}

const DEFAULT_SETTINGS: BearMDExportPluginSettings = {
  exportPath: "",
};

export default class BearMDExportPlugin extends Plugin {
  settings: BearMDExportPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "bear-md-export.export",
      name: "export",
      callback: async () => {
        const { exportPath } = this.settings;
        const notes = await readNotes(exportPath);
        let exportedNotesCount = 0;

        notes.forEach(async (note, name) => {
          const notePath = note.tag ? join(note.tag, name) : name;

          if (note.tag) {
            this.app.vault.createFolder(note.tag);
          }

          await this.app.vault.create(notePath, note.content);

          exportedNotesCount++;
        });

        new Notice(
          `Bear markdown export: ${exportedNotesCount} files exported`,
          2500
        );

        if (exportedNotesCount < notes.size) {
          new Notice(
            `Bear markdown export: ${
              notes.size - exportedNotesCount
            } files haven't been exported`,
            2500
          );
        }
      },
    });

    this.addSettingTab(new BearMDExportSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class BearMDExportSettingTab extends PluginSettingTab {
  plugin: BearMDExportPlugin;

  constructor(app: App, plugin: BearMDExportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Bear markdown export" });

    new Setting(containerEl)
      .setName("Path to export markdown files from")
      .setDesc(
        "Provide the path where your markdown files have been exported to"
      )
      .addText((text) =>
        text
          .setPlaceholder("/path/to/my/files")
          .setValue(this.plugin.settings.exportPath)
          .onChange(async (value) => {
            this.plugin.settings.exportPath = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
