export function hasScorePartwise(xml: string): boolean {
  return /<score-partwise\b/i.test(xml);
}

export function extractXmlPayload(raw: string): string {
  let text = raw.trim();

  const fenced = text.match(/```(?:xml)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    text = fenced[1].trim();
  } else {
    text = text
      .replace(/^```(?:xml)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const scoreStart = text.search(/<score-partwise\b/i);
  if (scoreStart >= 0) {
    const scoreFragment = text.slice(scoreStart);
    const scoreEnd = scoreFragment.search(/<\/score-partwise>/i);
    if (scoreEnd >= 0) {
      const endIndex = scoreEnd + "</score-partwise>".length;
      const prefix = extractXmlPreamble(text.slice(0, scoreStart));
      return `${prefix}${scoreFragment.slice(0, endIndex)}`.trim();
    }
  }

  const xmlStart = text.search(/<\?xml\b/i);
  if (xmlStart >= 0) {
    text = text.slice(xmlStart).trim();
  } else {
    const firstTag = text.search(/<[A-Za-z_][\w:.-]*(?:\s[^>]*)?>/);
    if (firstTag > 0) {
      text = text.slice(firstTag).trim();
    }
  }

  const root = findRootElement(text);
  if (!root) {
    return text;
  }

  const preamble = extractXmlPreamble(text.slice(0, root.start));
  const body = text.slice(root.start);
  const closingPattern = new RegExp(`</${escapeRegExp(root.name)}>`, "i");
  const closingMatch = closingPattern.exec(body);

  if (!closingMatch) {
    return `${preamble}${body}`.trim();
  }

  const endIndex = closingMatch.index + closingMatch[0].length;
  return `${preamble}${body.slice(0, endIndex)}`.trim();
}

function extractXmlPreamble(prefix: string): string {
  const parts = [
    prefix.match(/<\?xml[\s\S]*?\?>/i)?.[0],
    prefix.match(/<!DOCTYPE[\s\S]*?>/i)?.[0],
  ].filter(Boolean);

  return parts.length ? `${parts.join("\n")}\n` : "";
}

function findRootElement(xml: string): { name: string; start: number } | null {
  const tagPattern = /<([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(xml)) !== null) {
    const tag = match[0];
    if (
      tag.startsWith("<?") ||
      tag.startsWith("<!") ||
      tag.startsWith("</")
    ) {
      continue;
    }

    return { name: match[1], start: match.index };
  }

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
