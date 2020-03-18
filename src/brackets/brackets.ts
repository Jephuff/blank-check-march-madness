import { useEffect, useState } from 'react';
import useLocalStorage from 'useLocalStorage';
import { Data } from 'brackets/types';

import data2019 from './data/2019';
import data2020 from './data/2020';
import data2020Patreon from './data/2020-patreon';
import { Options } from 'allOptions';

export const bracketKeys = [
  'Bracket 2019',
  'Bracket 2020',
  'Bracket 2020 Patreon',
] as const;

const brackets: Array<{
  data: Data<0>;
  key: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon';
}> = [
  { data: data2019, key: 'Bracket 2019' },
  { data: data2020, key: 'Bracket 2020' },
  { data: data2020Patreon, key: 'Bracket 2020 Patreon' },
];

export const useBracket = (): [
  typeof brackets[0],
  (key: typeof brackets[0]['key']) => void
] => {
  const [bracketKey, setBracketKey] = useLocalStorage<
    typeof brackets[0]['key']
  >('bracket-key', 'Bracket 2020');

  const [bracket, setBracket] = useState(
    () => brackets.find(bracket => bracket.key === bracketKey) || brackets[0]
  );

  useEffect(() => {
    setBracket(
      brackets.find(bracket => bracket.key === bracketKey) || brackets[0]
    );
  }, [bracketKey]);

  return [bracket, setBracketKey];
};

export const useBracketSelection = (key: string) => {
  const [bracket] = useBracket();
  return useLocalStorage<Options | undefined>(
    `bracket-selection-${bracket.key}-key-${key}`,
    undefined
  );
};
