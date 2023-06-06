import { readFile } from "fs/promises";
import { join, basename } from "path";
import { sync } from "fast-glob";

export const readNotes = async (path: string) => {
  const filesToExport = sync(join(path, "**/*.md"));
  const notes = new Map<string, { tag: string; content: string }>();

  for (const note of filesToExport) {
    const content = await readFile(note, "utf-8");
    const tag = getFirstTag(content);

    notes.set(basename(note), {
      content,
      tag,
    });
  }

  return notes;
};

export const getFirstTag = (text: string): string => {
  const tagRe = /#(?<tag>[^# ]\S+)/m;
  const { tag = "" } = text.match(tagRe)?.groups ?? {};

  return tag.trim().replace(/ /g, "_");
};
