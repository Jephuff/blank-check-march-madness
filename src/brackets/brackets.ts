import { createUseAsync } from 'react-create-use-async';
import { Unreachable } from 'react-create-use-async/dist/UnreachableError';

import { useLocalStorage, useLocalStorageVersioned } from 'useLocalStorage';
import { Options } from 'allOptions';

export enum Bracket {
  'Bracket 2019',
  'Bracket 2020',
  'Bracket 2020 Patreon',
}

export const useBracketData = createUseAsync(
  ({ bracketKey }: { bracketKey: Bracket }) => {
    switch (bracketKey) {
      case Bracket['Bracket 2019']:
        return import('./data/2019').then((r) => r.default);
      case Bracket['Bracket 2020']:
        return import('./data/2020').then((r) => r.default);
      case Bracket['Bracket 2020 Patreon']:
        return import('./data/2020-patreon').then((r) => r.default);
      default:
        throw new Unreachable(bracketKey);
    }
  }
);

const bracketKeyMigration = (value: unknown): Bracket => {
  switch (typeof value) {
    case 'number':
      if (Bracket[value]) return value;
      break;
    case 'string':
      if (typeof Bracket[value as any] === 'number') {
        return (Bracket[value as any] as unknown) as any;
      }
      break;
  }

  return Bracket['Bracket 2020'];
};

export const useBracketKey = (): [Bracket, (key: Bracket) => void] => {
  const [bracketKey, setBracketKey] = useLocalStorage<Bracket>(
    'bracket-key',
    Bracket['Bracket 2020'],
    undefined,
    bracketKeyMigration
  );

  return [bracketKey, setBracketKey];
};

export const useBracketSelection = (key: string) => {
  const [bracketKey] = useBracketKey();
  return useLocalStorageVersioned<Options | undefined>(
    `bracket-selection-${bracketKey}-key-${key}`,
    undefined
  );
};
