export default class Trimmer {
  private maxLength: number;

  constructor(maxLength: number) {
    this.maxLength = maxLength;
  }

  trim = (text: string): string[] => {
    const result: string[] = [];

    while (this.isGreaterThanMaxLength(text)) {
      const sepIndex = this.getSeparationIndex(text);
      const trimmed = text.substring(0, sepIndex);
      result.push(trimmed);
      text = text.substring(sepIndex);
    }

    result.push(text);

    return result;
  };

  isSmallerOrEqualThanMaxLength = (text: string): boolean =>
    text.length <= this.maxLength;

  isGreaterThanMaxLength = (text: string): boolean =>
    !this.isSmallerOrEqualThanMaxLength(text);

  private getSeparationIndex = (text: string): number => {
    const index = this.findLeftSpace(text);

    if (index <= 0) return this.getEndIndex(text);

    return index;
  };

  private findLeftSpace = (text: string): number => {
    const end = this.getEndIndex(text);

    return text.substring(0, end).lastIndexOf(" ");
  };

  private getEndIndex = (text: string): number =>
    text.length > this.maxLength ? this.maxLength : text.length;
}
