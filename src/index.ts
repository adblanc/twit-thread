require("dotenv").config();
import Twit from "twit";
import Trimmer from "./Trimmer";
import { TWEET_MAX_LENGTH, TWEET_ROUTE } from "./constants/tweetMax";
import { IncomingMessage } from "http";
import { ERROR_TWEET_LENGTH } from "./constants/errors";

interface TweetResponse extends Response {
  data: Twit.Twitter.Status;
  resp: IncomingMessage;
}

type TweetFn = (text: string, options?: Twit.Params) => Promise<string>;

export default class TwitThread extends Twit {
  private trimmer: Trimmer;

  constructor(config: Twit.Options) {
    super(config);
    this.trimmer = new Trimmer(TWEET_MAX_LENGTH);
  }

  public tweetThread = async (textArr: string[]): Promise<string[]> => {
    const texts = this.trimmer.trim(textArr);

    const options: Twit.Params = {};
    for (let i = 0; i < texts.length; i++) {
      options.in_reply_to_status_id = await this.tweet(texts[i], options);
    }
    return texts;
  };

  public tweet: TweetFn = async (text, options) => {
    if (text.length > TWEET_MAX_LENGTH)
      return new Promise((res, rej) => rej(ERROR_TWEET_LENGTH));

    const {
      data: { id_str: idStr }
    } = (await this.post(TWEET_ROUTE, {
      status: text,
      ...options
    })) as TweetResponse;

    return idStr;
  };
}
