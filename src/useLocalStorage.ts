import { useState, useEffect, useCallback } from 'react';
import { useBracket } from 'brackets';
import EventEmitter3 from 'eventemitter3';
import _ from 'lodash';
import { Bracket } from 'brackets/brackets';
type StorableValue =
  | { [key: string]: any }
  | undefined
  | string
  | Array<unknown>
  | number;

interface Versions {
  version: number;
  versions: number;
}
function parseValue<Value>(
  k: string,
  initialValue: Value,
  version?: number,
  migration?: (value: unknown) => Value
): Value {
  let data = null;
  let cur = version ?? 1;
  while (!data && cur > 0) {
    data = window.localStorage.getItem(
      typeof version === 'number' ? `${k}-${cur}` : k
    );
    cur -= 1;
  }

  if (data) {
    const value = JSON.parse(data);
    return migration ? migration(value) : value;
  } else {
    return initialValue;
  }
}

const emitter = new EventEmitter3();

export const useLocalStorage = <Value extends StorableValue>(
  k: string,
  initialValueInput: Value,
  versionData?: Versions,
  migration?: (value: unknown) => Value
) => {
  const [initialValue, setInitialValueCached] = useState(initialValueInput);
  useEffect(() => {
    setInitialValueCached(value =>
      _.isEqual(value, initialValueInput) ? value : initialValueInput
    );
  }, [initialValueInput]);

  const version = versionData?.version;
  const key = versionData ? `${k}-${version}` : k;
  const getCurrentState = useCallback(
    () => parseValue(k, initialValue, version, migration),
    [k, initialValue, version, migration]
  );
  const [state, setState] = useState(getCurrentState);

  useEffect(() => {
    setState(getCurrentState());
  }, [getCurrentState]);

  useEffect(() => {
    const onUpdate = () => setState(getCurrentState());
    emitter.on(key, onUpdate);
    return () => {
      emitter.off(key, onUpdate);
    };
  }, [key, getCurrentState]);

  const setValue = useCallback(
    (data: Value | ((data: Value) => Value)) => {
      const newState = typeof data === 'function' ? data(state) : data;
      window.localStorage.setItem(key, JSON.stringify(newState));
      emitter.emit(key);
    },
    [key, state]
  );
  return [state, setValue] as const;
};

const defaultVersion = { version: 1, versions: 1 };
let version = defaultVersion;
export const useLocalStorageVersion = () => {
  const [legacyVersion] = useLocalStorage('version', defaultVersion);
  const [, bracketKey] = useBracket();
  const [v, setVersion] = useLocalStorage(
    `version-${bracketKey}`,
    bracketKey === Bracket['Bracket 2019'] ? legacyVersion : defaultVersion
  );
  version = v;
  return [v, setVersion] as const;
};

export const useLocalStorageVersioned = <Value extends StorableValue>(
  key: string,
  initialValue: Value
) => useLocalStorage(key, initialValue, version);
