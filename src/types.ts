export enum SetOption {
  KEEP_TTL = "KEEPTTL",
  ONLY_IF_UNSET = "NX",
  ONLY_IF_SET = "XX",
}

export enum Duration {
  ONE_SECOND = 1000,
  ONE_MINUTE = 60000,
  ONE_HOUR = 3.6e6,
  ONE_DAY = 8.64e7,
  ONE_WEEK = 6.048e8,
  ONE_MONTH = 2.628e9,
  ONE_YEAR = 3.154e10,
}
