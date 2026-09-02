import MarkdownIt, { type Token } from "markdown-it";
import { PDFDocument } from "pdf-lib";
import { createTypstCompiler, type TypstCompiler } from "typst-wasm";
import core1 from "typst-wasm/engine/engine.core.wasm";
import core2 from "typst-wasm/engine/engine.core2.wasm";
import core3 from "typst-wasm/engine/engine.core3.wasm";
import regularFont from "@typst-wasm/fonts/LibertinusSerif-Regular.otf";
import boldFont from "@typst-wasm/fonts/LibertinusSerif-Bold.otf";
import italicFont from "@typst-wasm/fonts/LibertinusSerif-Italic.otf";
import boldItalicFont from "@typst-wasm/fonts/LibertinusSerif-BoldItalic.otf";
import alegreyaFont from "./fonts/alegreya/Alegreya.ttf";
import alegreyaItalicFont from "./fonts/alegreya/Alegreya-Italic.ttf";
import alegreyaSansBoldFont from "./fonts/alegreya-sans/AlegreyaSans-Bold.ttf";
import workerSource from "typst-wasm/worker/web-worker?raw";
import sessionTemplate from "./templates/session-note.typ";
import cardTemplate from "./templates/index-card.typ";
import bookTemplate from "./templates/book.typ";
import { splitIndexCards } from "./cards.js";
import { paragraphSeparator, parseTaskText, prepareMarkdown } from "./markdown.js";
import { compactAbilityTable } from "./tables.js";

export interface Resource {
  path: string;
  data: Uint8Array;
}

export interface PublishInput {
  title: string;
  markdown: string;
  loadResource: (link: string) => Promise<Resource | null>;
}

export interface PublishedDocument {
  filename: string;
  data: Uint8Array;
}

interface ConvertedMarkdown {
  body: string;
  resourceLinks: Set<string>;
}

interface ConversionOptions {
  compactAbilityTables?: boolean;
}

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: true });
let compilerPromise: Promise<TypstCompiler> | null = null;

function asArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

function createInlineWorker() {
  const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
  const worker = new Worker(workerUrl, { type: "module" });
  return {
    listen: (onMessage: (data: unknown) => void, onError: (error: Error) => void) => {
      worker.addEventListener("message", (event) => onMessage(event.data));
      worker.addEventListener("error", (event) => onError(event.error ?? new Error(event.message)));
    },
    postMessage: (data: unknown) => worker.postMessage(data),
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    },
  };
}

async function getCompiler(): Promise<TypstCompiler> {
  if (!compilerPromise) {
    compilerPromise = (async () => {
      const compiler = await createTypstCompiler({
        backend: "worker",
        worker: createInlineWorker,
        packageCache: false,
        coreModules: {
          "engine.core.wasm": WebAssembly.compile(asArrayBuffer(core1)),
          "engine.core2.wasm": WebAssembly.compile(asArrayBuffer(core2)),
          "engine.core3.wasm": WebAssembly.compile(asArrayBuffer(core3)),
        },
      });
      await compiler.addFonts(
        regularFont,
        boldFont,
        italicFont,
        boldItalicFont,
        alegreyaFont,
        alegreyaItalicFont,
        alegreyaSansBoldFont,
      );
      return compiler;
    })();
  }
  return compilerPromise;
}

function escapeTypst(value: string): string {
  return value.replace(/[\\#\[\]_*`@$<>]/g, "\\$&");
}

function escapeString(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n");
}

function displayWikilinks(value: string): string {
  return value
    .replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "![]($1)")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");
}

function renderInline(children: Token[], resources: Set<string>): string {
  let output = "";
  for (const token of children) {
    switch (token.type) {
      case "text": {
        const task = parseTaskText(token.content);
        if (!task) output += escapeTypst(token.content);
        else {
          const mark = task.checked ? "#align(center + horizon)[#text(size: 7pt, weight: \"bold\")[×]]" : "";
          output += `#box(width: 0.72em, height: 0.72em, stroke: 0.7pt, inset: 0pt)[${mark}]#h(0.28em)${escapeTypst(task.text)}`;
        }
        break;
      }
      case "softbreak": output += " "; break;
      case "hardbreak": output += "#linebreak()"; break;
      case "strong_open": output += "#strong["; break;
      case "strong_close": output += "]"; break;
      case "em_open": output += "#emph["; break;
      case "em_close": output += "]"; break;
      case "s_open": output += "#strike["; break;
      case "s_close": output += "]"; break;
      case "code_inline": output += `#raw("${escapeString(token.content)}")`; break;
      case "link_open": break;
      case "link_close": break;
      case "image": {
        const source = String(token.attrGet("src") ?? "");
        resources.add(source);
        output += `#image("resources/${escapeString(source)}")`;
        break;
      }
      default:
        if (token.content) output += escapeTypst(token.content);
    }
  }
  return output;
}

function readTable(tokens: Token[], start: number, resources: Set<string>): { end: number; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] | null = null;
  let cell: string | null = null;
  let cursor = start + 1;
  for (; cursor < tokens.length && tokens[cursor].type !== "table_close"; cursor += 1) {
    const token = tokens[cursor];
    if (token.type === "tr_open") row = [];
    else if (token.type === "th_open" || token.type === "td_open") cell = "";
    else if (token.type === "inline" && cell !== null) cell += renderInline(token.children ?? [], resources);
    else if (token.type === "th_close" || token.type === "td_close") {
      if (row !== null && cell !== null) row.push(cell);
      cell = null;
    } else if (token.type === "tr_close" && row !== null) {
      rows.push(row);
      row = null;
    }
  }
  return { end: cursor, rows };
}

export function markdownToTypst(source: string, options: ConversionOptions = {}): ConvertedMarkdown {
  const cleaned = displayWikilinks(prepareMarkdown(source));
  const tokens = markdown.parse(cleaned, {});
  const resources = new Set<string>();
  const listKinds: Array<"bullet" | "ordered"> = [];
  let output = "";

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    switch (token.type) {
      case "heading_open": output += `\n${"=".repeat(Number(token.tag.slice(1)))} `; break;
      case "heading_close": output += "\n\n"; break;
      case "paragraph_close": output += paragraphSeparator(token.hidden); break;
      case "inline": output += renderInline(token.children ?? [], resources); break;
      case "bullet_list_open": listKinds.push("bullet"); break;
      case "ordered_list_open": listKinds.push("ordered"); break;
      case "bullet_list_close":
      case "ordered_list_close": listKinds.pop(); output += "\n"; break;
      case "list_item_open": {
        const marker = listKinds[listKinds.length - 1] === "ordered" ? "+" : "-";
        output += `${"  ".repeat(Math.max(0, listKinds.length - 1))}${marker} `;
        break;
      }
      case "list_item_close": output += "\n"; break;
      case "blockquote_open": output += "#quote(block: true)["; break;
      case "blockquote_close": output += "]\n\n"; break;
      case "fence": output += `#raw(block: true, lang: "${escapeString(token.info.trim())}", "${escapeString(token.content)}")\n\n`; break;
      case "code_block": output += `#raw(block: true, "${escapeString(token.content)}")\n\n`; break;
      case "html_inline":
        if (/^<br\s*\/?\s*>$/i.test(token.content)) output += "#linebreak()";
        break;
      case "html_block": break;
      case "hr": output += "#line(length: 100%)\n\n"; break;
      case "table_open": {
        if (options.compactAbilityTables) {
          const table = readTable(tokens, index, resources);
          const compact = compactAbilityTable(table.rows);
          if (compact) {
            output += `${compact}\n\n`;
            index = table.end;
            break;
          }
        }
        let columns = 0;
        for (let cursor = index; cursor < tokens.length && tokens[cursor].type !== "tr_close"; cursor += 1) {
          if (tokens[cursor].type === "th_open") columns += 1;
        }
        output += `#table(columns: (${Array(Math.max(columns, 1)).fill("1fr").join(", ")}), align: center, `;
        break;
      }
      case "table_close": output += ")\n\n"; break;
      case "thead_open": output += "table.header("; break;
      case "thead_close": output += "), "; break;
      case "th_open": output += "["; break;
      case "th_close": output += "], "; break;
      case "td_open": output += "["; break;
      case "td_close": output += "], "; break;
    }
  }
  return { body: output.trim(), resourceLinks: resources };
}

export function safeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "-");
}

async function compile(
  template: string,
  input: PublishInput,
  title = input.title,
  options: ConversionOptions = {},
): Promise<Uint8Array> {
  const converted = markdownToTypst(input.markdown, options);
  const compiler = await getCompiler();
  await compiler.clearFiles();
  for (const link of converted.resourceLinks) {
    const resource = await input.loadResource(link);
    if (resource) await compiler.addFile(`resources/${link}`, resource.data);
  }
  const source = template
    .replaceAll("$title$", escapeTypst(title))
    .replace("$body$", converted.body);
  await compiler.addSource("main.typ", source);
  await compiler.setMain("main.typ");
  const result = await compiler.compile({ format: "pdf" });
  return result.output;
}

export async function publishSession(input: PublishInput): Promise<PublishedDocument> {
  return {
    filename: `${safeFilename(input.title)}.pdf`,
    data: await compile(sessionTemplate, input, input.title, { compactAbilityTables: true }),
  };
}

export async function publishBook(input: PublishInput): Promise<PublishedDocument> {
  return { filename: `${safeFilename(input.title)}.pdf`, data: await compile(bookTemplate, input) };
}

export async function publishIndexCards(input: PublishInput): Promise<PublishedDocument> {
  const cards = splitIndexCards(input.markdown);
  if (cards.length === 0) throw new Error("No cards found. Each card must begin with a level-one Markdown heading.");
  const combined = await PDFDocument.create();
  for (const card of cards) {
    const bytes = await compile(
      cardTemplate,
      { ...input, title: card.title, markdown: card.body },
      card.title,
      { compactAbilityTables: true },
    );
    const cardPdf = await PDFDocument.load(bytes);
    const pages = await combined.copyPages(cardPdf, cardPdf.getPageIndices());
    for (const page of pages) combined.addPage(page);
  }
  return { filename: `${safeFilename(input.title)}.pdf`, data: await combined.save() };
}

export async function publishBooklet(input: PublishInput): Promise<PublishedDocument> {
  const reading = await publishBook(input);
  const source = await PDFDocument.load(reading.data);
  const booklet = await PDFDocument.create();
  const sourcePages = source.getPageCount();
  const totalPages = Math.ceil(sourcePages / 4) * 4;
  const sheets = totalPages / 4;
  const pageSize: [number, number] = [841.8898, 595.2756];

  const addSpread = async (left: number, right: number): Promise<void> => {
    const page = booklet.addPage(pageSize);
    for (const [slot, pageNumber] of [left, right].entries()) {
      if (pageNumber < 1 || pageNumber > sourcePages) continue;
      const embedded = await booklet.embedPage(source.getPage(pageNumber - 1));
      const halfWidth = pageSize[0] / 2;
      const scale = Math.min(halfWidth / embedded.width, pageSize[1] / embedded.height);
      page.drawPage(embedded, {
        x: slot * halfWidth + (halfWidth - embedded.width * scale) / 2,
        y: (pageSize[1] - embedded.height * scale) / 2,
        width: embedded.width * scale,
        height: embedded.height * scale,
      });
    }
  };

  for (let sheet = 0; sheet < sheets; sheet += 1) {
    await addSpread(totalPages - (2 * sheet), 1 + (2 * sheet));
    await addSpread(2 + (2 * sheet), totalPages - 1 - (2 * sheet));
  }
  return { filename: `${safeFilename(input.title)}-booklet.pdf`, data: await booklet.save() };
}
