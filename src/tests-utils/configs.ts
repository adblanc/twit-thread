require("dotenv").config();

export const fakeConfig = {
  consumer_key: "a",
  consumer_secret: "a",
  access_token: "a",
  access_token_secret: "a"
};

export const validConfig = {
  consumer_key: process.env.TEST_consumer_key as string,
  consumer_secret: process.env.TEST_consumer_secret as string,
  access_token: process.env.TEST_access_token as string,
  access_token_secret: process.env.TEST_access_token_secret as string
};
