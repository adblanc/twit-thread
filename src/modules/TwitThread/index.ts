require("dotenv").config();
import Twit from "twit";
import { IncomingMessage } from "http";
import Trimmer from "../Trimmer";
import {
  TWEET_MAX_LENGTH,
  TWEET_ROUTE,
  MEDIA_UPLOAD_ROUTE,
} from "../../constants/tweetMax";
import { ERROR_TWEET_LENGTH } from "../../constants/errors";

interface TweetResponse extends Response {
  data: Twit.Twitter.Status;
  resp: IncomingMessage;
}

interface TweetThread {
  text: string;
  options?: Twit.Params;
}

export type Thread = TweetThread[];

type TweetFn = (
  text: string,
  options?: Twit.Params
) => Promise<Twit.Twitter.Status>;

export class TwitThread extends Twit {
  private trimmer: Trimmer;

  constructor(config: Twit.Options) {
    super(config);
    this.trimmer = new Trimmer(TWEET_MAX_LENGTH);
  }

  public tweetThread = async (
    thread: Thread
  ): Promise<Twit.Twitter.Status[]> => {
    const trimmedTweets = this.trimmer.trim(thread.map((tweet) => tweet.text));

    const tweets = this.matchParamsToTweets(thread, trimmedTweets);

    const result: Twit.Twitter.Status[] = [];

    let options: Twit.Params = {};

    for (let i = 0; i < tweets.length; i++) {
      options = {
        in_reply_to_status_id: options.in_reply_to_status_id,
        ...tweets[i].options,
      };
      const data = await this.tweet(tweets[i].text, options);
      options.in_reply_to_status_id = data.id_str;
      result.push(data);
    }
    return result;
  };

  public tweet: TweetFn = async (text, options) => {
    if (text.length > TWEET_MAX_LENGTH)
      return new Promise((res, rej) => rej(ERROR_TWEET_LENGTH));

    let mediaIds: string;

    if (options?.media_data) {
      const { data }: any = await this.post(MEDIA_UPLOAD_ROUTE, {
        media_data: options.media_data,
      });
      mediaIds = data.media_id_string;
    }
    
    // media_ids will be a comma-delimited list of ids as per the twitter docs https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update
    if (options?.media_ids?.trim() !== "") {
      // check if mediaIds already as an id or not, if it has, we need to append a comma
      mediaIds = mediaIds.trim() !== "" ? `,${options.media_ids}` : options.media_ids;
    }

    const { data } = (await this.post(TWEET_ROUTE, {
      ...options,
      status: text,
      media_ids: mediaIds,
      media_data: undefined,
    })) as TweetResponse;

    return data;
  };

  private matchParamsToTweets = (
    tweets: Thread,
    trimmedTweets: string[]
  ): TweetThread[] => {
    const result: TweetThread[] = trimmedTweets.map((t) => ({ text: t }));

    let j = 0;
    for (let i = 0; i < result.length; i++) {
      result[i].options = tweets[j].options;
      i += this.howManyTimesTweetHasBeenTrimmed(tweets[j].text);
      j++;
    }

    return result;
  };

  private howManyTimesTweetHasBeenTrimmed = (tweet: string): number => {
    return Math.floor(tweet.length / TWEET_MAX_LENGTH);
  };
}
