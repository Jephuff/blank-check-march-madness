import { createUseAsync } from 'react-create-use-async';
import { Unreachable } from 'react-create-use-async/dist/UnreachableError';

import { useLocalStorage, useLocalStorageVersioned } from 'useLocalStorage';
import { Data } from 'brackets/types';
import { Options } from 'allOptions';

export const bracketKeys = [
  'Bracket 2019',
  'Bracket 2020',
  'Bracket 2020 Patreon',
] as const;

const useBracketData = createUseAsync(
  ({
    bracketKey,
  }: {
    bracketKey: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon';
  }) => {
    switch (bracketKey) {
      case 'Bracket 2019':
        return import('./data/2019').then(r => r.default);
      case 'Bracket 2020':
        return import('./data/2020').then(r => r.default);
      case 'Bracket 2020 Patreon':
        return import('./data/2020-patreon').then(r => r.default);
      default:
        throw new Unreachable(bracketKey);
    }
  }
);
export const useBracket = (): [
  Data<0>,
  'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon',
  (key: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon') => void
] => {
  const [bracketKey, setBracketKey] = useLocalStorage<
    'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon'
  >('bracket-key', 'Bracket 2020');

  return [useBracketData({ bracketKey }), bracketKey, setBracketKey];
};

export const useBracketSelection = (key: string) => {
  const [, bracketKey] = useBracket();
  return useLocalStorageVersioned<Options | undefined>(
    `bracket-selection-${bracketKey}-key-${key}`,
    undefined
  );
};
