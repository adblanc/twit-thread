export default class Trimmer {
  private maxLength: number;

  constructor(maxLength: number) {
    this.maxLength = maxLength;
  }

  trim = (textArr: string[]): string[] => {
    const [text, ...rest] = textArr;
    if (!text) return [];

    return [...this.trimText(text), ...this.trim(rest)];
  };

  private trimText = (text: string): string[] => {
    if (this.isGreaterThanMaxLength(text)) {
      const sepIndex = this.getSeparationIndex(text);
      const trimmed = text.substring(0, sepIndex);
      return [trimmed, ...this.trimText(text.substring(sepIndex))];
    }
    return [text];
  };

  private isGreaterThanMaxLength = (text: string): boolean =>
    text.length > this.maxLength;

  private getSeparationIndex = (text: string): number => {
    let endIndex = this.getEndIndex(text);
    if (this.isSpace(text.charAt(endIndex))) return endIndex;

    const spaceIndex = this.findLeftSpace(text, endIndex);
    if (spaceIndex > 0) {
      endIndex = spaceIndex + 1;
    }
    return endIndex;
  };

  private getEndIndex = (text: string): number =>
    this.isGreaterThanMaxLength(text) ? this.maxLength : text.length;

  private isSpace = (text: string): boolean => text === " ";

  private findLeftSpace = (text: string, end: number): number => {
    const spaceIndex = text.substring(0, end).lastIndexOf(" ");
    return spaceIndex;
  };
}
