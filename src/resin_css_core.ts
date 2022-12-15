//crc32 function based on https://stackoverflow.com/a/18639999
const makeCRCTable = () => {
  let c;
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
};
const crcTable = makeCRCTable();

export const crc32 = (str: string): string => {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  const value = (crc ^ -1) >>> 0;
  return value.toString(16).padStart(8, "0");
};

export function extractCssTemplate(
  template: TemplateStringsArray,
  values: (string | number)[]
): string {
  let text = "";
  let i = 0;
  for (i = 0; i < values.length; i++) {
    text += template[i];
    const value = values[i].toString();
    text += value;
  }
  text += template[i];
  return text;
}

export function extractNestedCss(
  cssBodyText: string,
  topSelector: string
): string {
  const srcLines = cssBodyText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((a) => !!a)
    .map((line) => line.replace(/\: /g, ":"))
    .map((line) => line.replace(/ \./g, "."))
    .map((line) => line.replace(/ \{/g, "{"))
    .map((line) => line.replace(/^\./g, " ."))
    .map((line) => line.replace(/^\&/g, ""));

  const cssBlocks: Record<string, string[]> = {};
  const selectorPaths: string[] = [topSelector];

  for (const line of srcLines) {
    if (line.endsWith("{")) {
      const selector = line.slice(0, line.length - 1);
      selectorPaths.push(selector);
    } else if (line.endsWith("}")) {
      selectorPaths.pop();
    } else {
      const selectorPath = selectorPaths.join("").replace(/ &/g, "");

      if (!cssBlocks[selectorPath]) {
        cssBlocks[selectorPath] = [];
      }
      cssBlocks[selectorPath].push(line);
    }
  }
  return Object.keys(cssBlocks)
    .map((key) => `${key}{${cssBlocks[key].join(" ")}}`)
    .join("\n");
}

export function getBaseClassNameFromCssText(cssText: string) {
  return cssText.slice(1, 12);
}