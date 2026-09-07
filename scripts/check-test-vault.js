// Run via Obsidian's eval command after opening the generated test vault.
(async () => {
  if (app.vault.getName() !== "test-vault") throw new Error("Wrong test vault");
  const id = "trolls-printing-press";
  const results = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  await app.plugins.disablePluginAndSave(id);
  await app.plugins.enablePluginAndSave(id);
  const NativeWorker = window.Worker;
  const workers = new Set();
  window.Worker = class extends NativeWorker {
    constructor(...args) {
      super(...args);
      // Obsidian's PDF viewer also creates workers; only track the inline compiler.
      if (String(args[0]).startsWith("blob:") && args[1]?.type === "module") workers.add(this);
    }
    terminate() { workers.delete(this); return super.terminate(); }
  };
  try {
    const note = app.vault.getFileByPath("Release check.md");
    const plugin = app.plugins.plugins[id];
    const tab = app.setting.pluginTabs.find((tab) => tab.id === id);
    assert(tab, "Settings tab was not registered");
    assert(tab.getSettingDefinitions()[0].control.key === "outputFolder", "Output setting is not searchable");
    for (const [command, folder, filename] of [
      ["publish-active-note", "session", "Release check.pdf"],
      ["publish-active-note-as-book", "book", "Release check.pdf"],
      ["publish-active-note-as-booklet", "booklet", "Release check-booklet.pdf"],
      ["publish-active-note-as-two-column-book", "book-2", "Release check-two-column.pdf"],
      ["publish-active-note-as-two-column-booklet", "booklet-2", "Release check-two-column-booklet.pdf"],
      ["publish-index-cards", "cards", "Release check.pdf"],
    ]) {
      await tab.setControlValue("outputFolder", `checks/${folder}`);
      const outputPath = `checks/${folder}/${filename}`;
      const previousModified = app.vault.getFileByPath(outputPath)?.stat.mtime ?? 0;
      await app.workspace.getLeaf(false).openFile(note);
      await app.commands.commands[`${id}:${command}`].callback();
      const output = app.vault.getFileByPath(outputPath);
      assert(output, `Missing PDF for ${command}`);
      assert(output.stat.mtime > previousModified, `PDF was not updated for ${command}`);
      const bytes = await app.vault.readBinary(output);
      assert(new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-", `Invalid PDF for ${command}`);
      results.push({ command, bytes: bytes.byteLength, path: output.path });
    }
    assert(workers.size === 1, `Publishing should reuse one compiler worker; found ${workers.size}`);
    await app.plugins.disablePluginAndSave(id);
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    assert(!Object.keys(app.commands.commands).some((key) => key.startsWith(`${id}:`)), "Commands survived disable");
    results.push({ workersAfterDisable: workers.size });
    await app.plugins.enablePluginAndSave(id);
    assert(app.plugins.plugins[id].settings.outputFolder === "checks/cards", "Settings did not persist");
    const reloadedTab = app.setting.pluginTabs.find((tab) => tab.id === id);
    await reloadedTab.setControlValue("outputFolder", "   ");
    assert(app.plugins.plugins[id].settings.outputFolder === "publishing/output", "Empty output folder did not reset");
    assert(app.plugins.plugins[id] !== plugin, "Plugin did not reload");
    results.push({ settingsPersisted: true, reloadSucceeded: true });
    assert(workers.size === 0, "Compiler worker survived disabling the plugin");
    return JSON.stringify(results);
  } finally {
    window.Worker = NativeWorker;
    for (const worker of workers) worker.terminate();
  }
})();
