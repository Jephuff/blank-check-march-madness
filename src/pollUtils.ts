export const getPollHref = (poll: string) =>
  poll.match(/^http/)
    ? poll
    : `https://twitter.com/blankcheckpod/status/${poll}`;

export const getPollVotedStorageKey = (poll: string) => `poll-voted-${poll}`;
