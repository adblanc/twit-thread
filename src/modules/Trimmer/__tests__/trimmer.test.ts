import Trimmer from "..";

describe("Trimmer", () => {
  describe("public method trim", () => {
    describe("trimming only with on string in array", () => {
      it("should trim normally according to length", () => {
        const maxLength = 10;
        const t = new Trimmer(maxLength);

        expect(t.trim(["a".repeat(maxLength)])).toMatchObject([
          "a".repeat(maxLength)
        ]);
        expect(t.trim(["a".repeat(maxLength * 2)])).toMatchObject([
          "a".repeat(10),
          "a".repeat(10)
        ]);
        expect(t.trim(["a".repeat(maxLength + 1)])).toMatchObject([
          "a".repeat(10),
          "a".repeat(1)
        ]);
        expect(t.trim(["a".repeat(maxLength - 1)])).toMatchObject([
          "a".repeat(maxLength - 1)
        ]);

        expect(t.trim(["a".repeat(maxLength + 5)])).toMatchObject([
          "a".repeat(maxLength),
          "a".repeat(5)
        ]);
      });
      it("should not trim if length is less than max Length", () => {
        const maxLength = 10;
        const t = new Trimmer(maxLength);

        const withSpace = "abc abc";

        expect(t.trim([withSpace])).toMatchObject([withSpace]);
        expect(t.trim(["a".repeat(10)])).toMatchObject(["a".repeat(10)]);
      });
      it("should trim if length > maxLength", () => {
        const maxLength = 3;
        const t = new Trimmer(maxLength);

        const bizarre = "  abc";
        const strange = "a  abc";
        const spaceAtMaxLength = "abc ok";
        const spaceBeforeMaxLength = "ab c ok";
        const withSpace = "abc abc";
        const noSpace = "abcabcabcab ";

        expect(t.trim([spaceAtMaxLength])).toMatchObject(["abc", " ok"]);
        expect(t.trim([spaceBeforeMaxLength])).toMatchObject([
          "ab ",
          "c ",
          "ok"
        ]);
        expect(t.trim([bizarre])).toMatchObject(["  ", "abc"]);
        expect(t.trim([strange])).toMatchObject(["a  ", "abc"]);
        expect(t.trim([withSpace])).toMatchObject(["abc", " ab", "c"]);
        expect(t.trim([noSpace])).toMatchObject(["abc", "abc", "abc", "ab "]);
      });
    });
    describe("trimming with more than one string", () => {
      const createArrayOfStrings = (
        arrLength: number,
        stringLength: number
      ): string[] => {
        return [...new Array(arrLength)].map(() => "a".repeat(stringLength));
      };

      it("should return the same if strings length === maxLength", () => {
        const MAX_LENGTH = 10;
        const t = new Trimmer(MAX_LENGTH);

        const textsToTrim = createArrayOfStrings(MAX_LENGTH, MAX_LENGTH);

        expect(t.trim(textsToTrim)).toMatchObject(textsToTrim);
      });
      it("should return the same if strings length < maxLength", () => {
        const MAX_LENGTH = 15;
        const STRING_LENGTH = 10;
        const ARRAY_LENGTH = 5;
        const t = new Trimmer(MAX_LENGTH);

        const textsToTrim = createArrayOfStrings(ARRAY_LENGTH, STRING_LENGTH);

        expect(t.trim(textsToTrim)).toMatchObject(textsToTrim);
      });
      it("should return trimmed if strings length > maxLength", () => {
        const MAX_LENGTH = 1;
        const STRING_LENGTH = 2;
        const ARRAY_LENGTH = 5;
        const t = new Trimmer(MAX_LENGTH);

        const textsToTrim = createArrayOfStrings(ARRAY_LENGTH, STRING_LENGTH);

        const waitedResult = createArrayOfStrings(
          ARRAY_LENGTH * Math.round(STRING_LENGTH / MAX_LENGTH),
          MAX_LENGTH
        );

        expect(t.trim(textsToTrim)).toHaveLength(10);
        expect(t.trim(textsToTrim)).toMatchObject(waitedResult);
      });
      it("should return trimmed if strings length > maxLength", () => {
        const MAX_LENGTH = 1;
        const STRING_LENGTH = 2;
        const ARRAY_LENGTH = 5;
        const t = new Trimmer(MAX_LENGTH);

        const textsToTrim = createArrayOfStrings(ARRAY_LENGTH, STRING_LENGTH);

        const waitedResult = createArrayOfStrings(
          ARRAY_LENGTH * Math.round(STRING_LENGTH / MAX_LENGTH),
          MAX_LENGTH < STRING_LENGTH ? MAX_LENGTH : STRING_LENGTH
        );

        expect(t.trim(textsToTrim)).toHaveLength(10);
        expect(t.trim(textsToTrim)).toMatchObject(waitedResult);
      });
      it("should return good trim with left spaces", () => {
        const MAX_LENGTH = 2;
        const t = new Trimmer(MAX_LENGTH);

        const textsToTrim = ["ab c", " abc", "abc", "   abc"];
        const waitedResult = [
          "ab",
          " c",
          " a",
          "bc",
          "ab",
          "c",
          "  ",
          " a",
          "bc"
        ];

        expect(t.trim(textsToTrim)).toMatchObject(waitedResult);
      });
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

      expect(t["getSeparationIndex"](middle)).toBe(middle.lastIndexOf(" ") + 1);

      expect(t["getSeparationIndex"](beginAndMiddle)).toBe(
        beginAndMiddle.lastIndexOf(" ") + 1
      );

      expect(t["getSeparationIndex"](pastMaxLength)).toBe(
        pastMaxLength.lastIndexOf(" ", 10) + 1
      );
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
