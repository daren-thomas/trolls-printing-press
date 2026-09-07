import { App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
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

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [{
      name: "Output folder",
      desc: "Folder relative to the active note. Layouts and fonts are supplied by the printing press.",
      control: { type: "text", key: "outputFolder", placeholder: DEFAULT_SETTINGS.outputFolder },
    }];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key !== "outputFolder" || typeof value !== "string") return;
    this.printingPress.settings.outputFolder = value.trim() || DEFAULT_SETTINGS.outputFolder;
    await this.printingPress.saveSettings();
  }
}
