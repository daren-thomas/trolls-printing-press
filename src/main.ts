import { Notice, Plugin, TFile, normalizePath } from "obsidian";
import path from "node:path/posix";
import {
  publishBook,
  publishBooklet,
  publishIndexCards,
  publishSession,
  type PublishInput,
  type PublishedDocument,
} from "./publisher";
import { DEFAULT_SETTINGS, PrintingPressSettingTab, type PrintingPressSettings } from "./settings";

type PublicationKind = "session" | "book" | "booklet" | "cards";

export default class TrollsPrintingPress extends Plugin {
  settings: PrintingPressSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addCommand({ id: "publish-active-note", name: "Publish active note", callback: () => this.publish("session") });
    this.addCommand({ id: "publish-active-note-as-book", name: "Publish active note as book", callback: () => this.publish("book") });
    this.addCommand({ id: "publish-active-note-as-booklet", name: "Publish active note as booklet", callback: () => this.publish("booklet") });
    this.addCommand({ id: "publish-index-cards", name: "Publish index cards", callback: () => this.publish("cards") });
    this.addRibbonIcon("printer", "Publish active note", () => this.publish("session"));
    this.addSettingTab(new PrintingPressSettingTab(this.app, this));
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async publish(kind: PublicationKind): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!(activeFile instanceof TFile) || activeFile.extension !== "md") {
      new Notice("Open a Markdown note before publishing.");
      return;
    }
    const progress = new Notice(`Publishing ${activeFile.basename}…`, 0);
    try {
      const input = await this.createInput(activeFile);
      let result: PublishedDocument;
      if (kind === "book") result = await publishBook(input);
      else if (kind === "booklet") result = await publishBooklet(input);
      else if (kind === "cards") result = await publishIndexCards(input);
      else result = await publishSession(input);
      const outputFile = await this.writeOutput(activeFile, result);
      await this.app.workspace.getLeaf("tab").openFile(outputFile);
      progress.hide();
      new Notice(`Published ${outputFile.path}`, 8000);
    } catch (error) {
      progress.hide();
      const message = error instanceof Error ? error.message : String(error);
      console.error("Trolls' Printing Press failed", error);
      new Notice(`Publishing failed: ${message}`, 12000);
    }
  }

  private async createInput(source: TFile): Promise<PublishInput> {
    return {
      title: source.basename,
      markdown: await this.app.vault.cachedRead(source),
      loadResource: async (rawLink) => {
        const link = decodeURIComponent(rawLink);
        const resource = this.app.metadataCache.getFirstLinkpathDest(link, source.path);
        if (!(resource instanceof TFile)) return null;
        return { path: resource.path, data: new Uint8Array(await this.app.vault.readBinary(resource)) };
      },
    };
  }

  private async writeOutput(source: TFile, result: PublishedDocument): Promise<TFile> {
    const sourceFolder = path.dirname(source.path);
    const outputFolder = normalizePath(path.join(sourceFolder, this.settings.outputFolder));
    if (outputFolder.startsWith("../") || outputFolder === "..") {
      throw new Error("The output folder must be inside the current vault.");
    }
    await this.ensureFolder(outputFolder);
    const outputPath = normalizePath(path.join(outputFolder, result.filename));
    const bytes = result.data.buffer.slice(
      result.data.byteOffset,
      result.data.byteOffset + result.data.byteLength,
    ) as ArrayBuffer;
    const existing = this.app.vault.getAbstractFileByPath(outputPath);
    if (existing instanceof TFile) {
      await this.app.vault.modifyBinary(existing, bytes);
      return existing;
    }
    if (existing) throw new Error(`Cannot publish over a folder: ${outputPath}`);
    return this.app.vault.createBinary(outputPath, bytes);
  }

  private async ensureFolder(folder: string): Promise<void> {
    let current = "";
    for (const segment of folder.split("/").filter(Boolean)) {
      current = current ? `${current}/${segment}` : segment;
      if (!(await this.app.vault.adapter.exists(current))) await this.app.vault.adapter.mkdir(current);
    }
  }
}
