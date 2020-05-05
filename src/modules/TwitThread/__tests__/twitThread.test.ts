import fs from "fs";
import path from "path";

import { fakeConfig, validConfig } from "../../../tests-utils/configs";
import { ERROR_TWEET_LENGTH } from "../../../constants/errors";
import { randomString } from "../../../tests-utils/helpers";
import Trimmer from "../../Trimmer";
import { TWEET_MAX_LENGTH } from "../../../constants/tweetMax";
import { TwitThread, Thread } from "..";

describe("TwitThread", () => {
  it("should construct properly", () => {
    const t = new TwitThread(fakeConfig);

    expect(t.get).toBeDefined();
    expect(t.getAuth).toBeDefined();
    expect(t.post).toBeDefined();
    expect(t.postMediaChunked).toBeDefined();
    expect(t.postMediaChunked).toBeDefined();
    expect(t.setAuth).toBeDefined();
    expect(t.stream).toBeDefined();
    expect(t.tweet).toBeDefined();
    expect(t.tweetThread).toBeDefined();
  });

  describe("matchParamsToTweet", () => {
    it("should keep every params if no trims needed", () => {
      const t = new TwitThread(fakeConfig);

      const tweets = t["matchParamsToTweets"](
        [
          { text: "123", options: { media_data: "salut123" } },
          { text: "456", options: { media_data: "salut456" } },
        ],
        ["123", "456"]
      );

      expect(tweets.length).toBe(2);
      expect(tweets[0].text).toBe("123");
      expect(tweets[0].options?.media_data).toBe("salut123");
      expect(tweets[1].text).toBe("456");
      expect(tweets[1].options?.media_data).toBe("salut456");
    });

    it("should no apply options to other parts of trimmed tweet", () => {
      const t = new TwitThread(fakeConfig);

      const tweets = t["matchParamsToTweets"](
        [
          { text: "a".repeat(281), options: { media_data: "a" } },
          { text: "b", options: { media_data: "b" } },
        ],
        ["a".repeat(280), "a", "b"]
      );

      expect(tweets.length).toBe(3);
      expect(tweets[0].text).toBe("a".repeat(280));
      expect(tweets[0].options?.media_data).toBe("a");
      expect(tweets[1].text).toBe("a");
      expect(tweets[1].options).not.toBeDefined();
      expect(tweets[2].text).toBe("b");
      expect(tweets[2].options?.media_data).toBe("b");
    });
  });

  describe("with medias", () => {
    it("should post a media with first tweet of the thread", async () => {
      const t = new TwitThread(validConfig);

      await t.tweetThread([
        {
          text: "ceci est un test" + randomString(5),
          options: {
            media_data: fs.readFileSync(
              path.join(__dirname, "../../../../images/screenshot.png"),
              {
                encoding: "base64",
              }
            ),
          },
        },
      ]);
    });
  });

  describe("mocked", () => {
    describe("tweet method", () => {
      it("should throw error if tries to tweet a single tweet overLengthed", async () => {
        expect.assertions(1);
        try {
          const t = new TwitThread(fakeConfig);
          const textOverLength = randomString(5) + "a".repeat(281);

          await t.tweet(textOverLength);
        } catch (e) {
          expect(e).toEqual(ERROR_TWEET_LENGTH);
        }
      });

      it("should tweet and return an id", async () => {
        const t = new TwitThread(validConfig);
        const text = randomString(5);

        const mockTweet = jest
          .spyOn(t, "tweet")
          .mockImplementation((text: string) => {
            return new Promise((res) => {
              return res("id" + text);
            });
          });

        const id = await t.tweet(text);

        expect(id).toBeDefined();
        expect(id.length).toBeGreaterThan(0);
        expect(mockTweet).toHaveBeenCalledWith(text);
        expect(mockTweet).toHaveBeenCalledTimes(1);
      });
    });

    describe("tweetThread", () => {
      it("should tweet a thread and return the thread as it was if not trimmed", async () => {
        const tweetNbr = 4;
        const text = randomString(5);
        const initialTexts = [...new Array(tweetNbr)].map(() => text);
        const t = new TwitThread(fakeConfig);
        const mockTweet = jest
          .spyOn(t, "tweet")
          .mockImplementation((text: string) => {
            return new Promise((res) => res("id" + text));
          });
        const mockTweetThread = jest
          .spyOn(t, "tweetThread")
          .mockImplementation((tweets: Thread) => {
            tweets.forEach((tweet) => t.tweet(tweet.text));

            const trimmer = new Trimmer(TWEET_MAX_LENGTH);
            return new Promise((res) =>
              res(trimmer.trim(tweets.map((tweet) => tweet.text)))
            );
          });

        expect.assertions(tweetNbr + 5);

        const texts = await t.tweetThread(
          initialTexts.map((text) => ({ text }))
        );

        expect(mockTweetThread).toHaveBeenCalledWith(
          initialTexts.map((text) => ({ text }))
        );
        expect(mockTweetThread).toHaveBeenCalledTimes(1);
        expect(mockTweet).toHaveBeenCalledTimes(tweetNbr);
        for (let i = 0; i < tweetNbr; i++) {
          expect(mockTweet).toHaveBeenNthCalledWith(i + 1, initialTexts[i]);
        }
        expect(mockTweet).toHaveBeenLastCalledWith(initialTexts[tweetNbr - 1]);
        expect(texts).toMatchObject(initialTexts);
      });

      it("should tweet a thread and return the thread trimmed if some strings were overlengthed", async () => {
        expect.assertions(7);
        const tweetNbr = 2;
        const initialTexts = [...new Array(tweetNbr)].map(() =>
          "a".repeat(281)
        );
        const t = new TwitThread(fakeConfig);
        const mockTweet = jest
          .spyOn(t, "tweet")
          .mockImplementation((text: string) => {
            return new Promise((res) => res("id" + text));
          });
        const mockTweetThread = jest
          .spyOn(t, "tweetThread")
          .mockImplementation((thread: Thread) => {
            const trimmer = new Trimmer(TWEET_MAX_LENGTH);
            const trimmed = trimmer.trim(thread.map((t) => t.text));
            trimmed.forEach((text) => t.tweet(text));

            return new Promise((res) => res(trimmed));
          });

        const texts = await t.tweetThread(
          initialTexts.map((text) => ({ text }))
        );

        expect(mockTweetThread).toHaveBeenCalledWith(
          initialTexts.map((text) => ({ text }))
        );
        expect(mockTweetThread).toHaveBeenCalledTimes(1);
        expect(mockTweet).toHaveBeenNthCalledWith(1, "a".repeat(280));
        expect(mockTweet).toHaveBeenNthCalledWith(2, "a");
        expect(mockTweet).toHaveBeenNthCalledWith(3, "a".repeat(280));
        expect(mockTweet).toHaveBeenNthCalledWith(4, "a");
        expect(texts).toMatchObject([
          "a".repeat(280),
          "a",
          "a".repeat(280),
          "a",
        ]);
      });
    });
  });

  describe("Valid config required (be careful it will tweets some content", () => {
    it("should tweet and return valid tweet id", async () => {
      expect.assertions(2);
      const t = new TwitThread(validConfig);
      const text = randomString(5);

      const id = await t.tweet(text);

      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });
    it("should tweet a thread and return the thread as it was if not trimmed", async () => {
      expect.assertions(1);
      const t = new TwitThread(validConfig);
      const tweetNbr = 3;
      const text = randomString(5);
      const initialTexts = [...new Array(tweetNbr)].map(() => text);

      const texts = await t.tweetThread(initialTexts.map((text) => ({ text })));
      expect(texts).toMatchObject(initialTexts);
    });
    it("should tweet a thread and return the thread trimmed if some strings were overlengthed", async () => {
      expect.assertions(4);
      const t = new TwitThread(validConfig);
      const tweetNbr = 2;
      const initialTexts = [...new Array(tweetNbr)].map(() =>
        randomString(281)
      );
      const texts = await t.tweetThread(initialTexts.map((text) => ({ text })));

      expect(texts[0]).toHaveLength(280);
      expect(texts[1]).toHaveLength(1);
      expect(texts[2]).toHaveLength(280);
      expect(texts[3]).toHaveLength(1);
    });
  });
});
