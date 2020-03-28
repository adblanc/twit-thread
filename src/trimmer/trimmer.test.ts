import Trimmer from "../Trimmer";

describe("Trimmer", () => {
  describe("public method trim", () => {
    it("should trim normally according to length", () => {
      const maxLength = 10;
      const t = new Trimmer(maxLength);

      expect(t.trim("a".repeat(maxLength))).toMatchObject([
        "a".repeat(maxLength)
      ]);
      expect(t.trim("a".repeat(maxLength * 2))).toMatchObject([
        "a".repeat(10),
        "a".repeat(10)
      ]);
      expect(t.trim("a".repeat(maxLength + 1))).toMatchObject([
        "a".repeat(10),
        "a".repeat(1)
      ]);
      expect(t.trim("a".repeat(maxLength - 1))).toMatchObject([
        "a".repeat(maxLength - 1)
      ]);

      expect(t.trim("a".repeat(maxLength + 5))).toMatchObject([
        "a".repeat(maxLength),
        "a".repeat(5)
      ]);
    });
    it("should not trim if length is less than max Length", () => {
      const maxLength = 10;
      const t = new Trimmer(maxLength);

      const withSpace = "abc abc";

      expect(t.trim(withSpace)).toMatchObject([withSpace]);
      expect(t.trim("a".repeat(10))).toMatchObject(["a".repeat(10)]);
    });
    it("should trim if length > maxLength", () => {
      const maxLength = 3;
      const t = new Trimmer(maxLength);

      const withSpace = "abc abc";
      const noSpace = "abcabcabcab ";

      expect(t.trim(withSpace)).toMatchObject(["abc", " ab", "c"]);
      expect(t.trim(noSpace)).toMatchObject(["abc", "abc", "abc", "ab "]);
    });
  });
  describe("private method getSeparatorIndex", () => {
    it("sep index should be maxLength if no left space found", () => {
      const maxLength = 10;
      const t = new Trimmer(maxLength);

      expect(t["getSeparationIndex"]("a".repeat(maxLength))).toBe(maxLength);

      t["maxLength"] = 0;
      expect(t["getSeparationIndex"]("a".repeat(maxLength))).toBe(0);

      t["maxLength"] = 5;
      expect(t["getSeparationIndex"]("a".repeat(maxLength))).toBe(5);

      t["maxLength"] = 20;
      expect(t["getSeparationIndex"]("a".repeat(maxLength))).toBe(maxLength);
    });
    it("sep index should be left space index", () => {
      const maxLength = 10;
      const t = new Trimmer(maxLength);

      const middle = "1234 56789";
      const beginAndMiddle = " 1234 56789";
      const pastMaxLength = " 1234 56789 ";

      expect(t["getSeparationIndex"](middle)).toBe(middle.lastIndexOf(" "));

      expect(t["getSeparationIndex"](beginAndMiddle)).toBe(
        beginAndMiddle.lastIndexOf(" ")
      );

      expect(t["getSeparationIndex"](pastMaxLength)).toBe(5);
    });
  });
  describe("private method getEndIndex", () => {
    it("should return text length if <= maxLength", () => {
      const maxLength = 10;
      const t = new Trimmer(maxLength);

      expect(t["getEndIndex"]("a".repeat(maxLength))).toBe(maxLength);

      expect(t["getEndIndex"]("a".repeat(maxLength / 2))).toBe(maxLength / 2);

      expect(t["getEndIndex"]("")).toBe(0);
    });
    it("should return maxLength if text.length > maxLength", () => {
      const maxLength = 10;
      const t = new Trimmer(maxLength);

      expect(t["getEndIndex"]("a".repeat(maxLength + 1))).toBe(maxLength);

      expect(t["getEndIndex"]("a".repeat(maxLength * 10))).toBe(maxLength);

      expect(t["getEndIndex"]("a".repeat(10000))).toBe(maxLength);
    });
  });
});
