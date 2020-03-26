import { Bracket, useBracketData, Data } from '../..';

function getWinners(arr: Array<Data | string>) {
  return arr.map((a) => (typeof a === 'string' ? a : a.winner));
}

function checkOptions(arr: Array<Data | string>) {
  arr.forEach((a) => typeof a !== 'string' && checkWinner(a));
}

function checkWinner(data: Data) {
  if (data.winner) expect(getWinners(data.options)).toContain(data.winner);
  checkOptions(data.options);
}

describe('bracket data', () => {
  it('all winners should be possible', async () => {
    expect.hasAssertions();
    await Promise.all(
      Object.values(Bracket)
        .filter((file): file is Bracket => typeof file === 'number')
        .map(async (file) => {
          const data = await useBracketData.preload({ bracketKey: file });
          checkWinner(data);
        })
    );
  });
});
