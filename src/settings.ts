import { App, PluginSettingTab, Setting } from "obsidian";
import type TrollsPrintingPress from "./main";

export interface PrintingPressSettings {
  outputFolder: string;
}

export const DEFAULT_SETTINGS: PrintingPressSettings = {
  outputFolder: "publishing/output",
};

export class PrintingPressSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly printingPress: TrollsPrintingPress) {
    super(app, printingPress);
  }

  display(): void {
    this.containerEl.empty();
    this.containerEl.createEl("h2", { text: "Trolls' Printing Press" });
    new Setting(this.containerEl)
      .setName("Output folder")
      .setDesc("Folder relative to the active note. Layouts and fonts are supplied by the printing press.")
      .addText((text) => text
        .setPlaceholder(DEFAULT_SETTINGS.outputFolder)
        .setValue(this.printingPress.settings.outputFolder)
        .onChange(async (value) => {
          this.printingPress.settings.outputFolder = value.trim() || DEFAULT_SETTINGS.outputFolder;
          await this.printingPress.saveSettings();
        }));
  }
}
