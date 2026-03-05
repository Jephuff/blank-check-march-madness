import { getPollHref, getPollVotedStorageKey } from './pollUtils';

describe('poll utils', () => {
  it('uses twitter status link when poll value is an id', () => {
    expect(getPollHref('1377259680704180229')).toBe(
      'https://twitter.com/blankcheckpod/status/1377259680704180229'
    );
  });

  it('keeps full poll URLs unchanged', () => {
    expect(getPollHref('https://poll.fm/123456')).toBe(
      'https://poll.fm/123456'
    );
  });

  it('builds a stable localStorage key for voted state', () => {
    expect(getPollVotedStorageKey('https://poll.fm/123456')).toBe(
      'poll-voted-https://poll.fm/123456'
    );
  });
});
