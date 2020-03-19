import { useEffect, useState, useCallback } from 'react';
import { useLocalStorage, useLocalStorageVersioned } from 'useLocalStorage';
import { Data } from 'brackets/types';

// import data2019 from './data/2019';
// import data2020 from './data/2020';
// import data2020Patreon from './data/2020-patreon';
import { Options } from 'allOptions';

export const bracketKeys = [
  'Bracket 2019',
  'Bracket 2020',
  'Bracket 2020 Patreon',
] as const;

const brackets: Array<
  | {
      data: Data<0>;
      key: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon';
    }
  | {
      data: Promise<void>;
      key: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon';
    }
> = [
  {
    key: 'Bracket 2019',
    data: import('./data/2019').then(r => {
      brackets[0].data = r.default;
    }),
  },
  {
    key: 'Bracket 2020',
    data: import('./data/2020').then(r => {
      brackets[1].data = r.default;
    }),
  },
  {
    key: 'Bracket 2020 Patreon',
    data: import('./data/2020-patreon').then(r => {
      brackets[2].data = r.default;
    }),
  },
];

export const useBracket = (): [
  Data<0>,
  'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon',
  (key: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon') => void
] => {
  const [bracketKey, setBracketKey] = useLocalStorage<
    'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon'
  >('bracket-key', 'Bracket 2020');

  const getCurrentBracket = useCallback(() => {
    const data =
      brackets.find(bracket => bracket.key === bracketKey) || brackets[0];

    if (data.data instanceof Promise) {
      console.log('throw promise1');
      throw data.data;
    }
    return data.data;
  }, [bracketKey]);

  const [bracket, setBracket] = useState(getCurrentBracket);

  useEffect(() => {
    setBracket(getCurrentBracket());
  }, [getCurrentBracket]);

  return [bracket, bracketKey, setBracketKey];
};

export const useBracketSelection = (key: string) => {
  const [, bracketKey] = useBracket();
  return useLocalStorageVersioned<Options | undefined>(
    `bracket-selection-${bracketKey}-key-${key}`,
    undefined
  );
};
