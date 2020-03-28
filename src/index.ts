import Twit from "twit";

export default class TwitThread extends Twit {
  constructor(config: Twit.Options) {
    super(config);
  }
}
