import { useState, useEffect, useCallback } from 'react';
import { useBracket } from 'brackets';
import EventEmitter3 from 'eventemitter3';

type StorableValue =
  | { [key: string]: unknown }
  | undefined
  | string
  | Array<unknown>;
interface Versions {
  version: number;
  versions: number;
}
function parseValue<Value>(
  k: string,
  initialValue: Value,
  version?: number
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
    return JSON.parse(data);
  } else {
    return initialValue;
  }
}

const emitter = new EventEmitter3();

const useLocalStorage = <Value extends StorableValue>(
  k: string,
  initialValue: Value,
  versionData?: Versions
) => {
  const version = versionData?.version;
  const key = versionData ? `${k}-${version}` : k;
  const getCurrentState = useCallback(
    () => parseValue(k, initialValue, version),
    [k, initialValue, version]
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
      if (typeof data === 'function') {
        setState(s => {
          const newState = data(s);
          window.localStorage.setItem(key, JSON.stringify(newState));
          emitter.emit(key);
          return newState;
        });
      } else {
        window.localStorage.setItem(key, JSON.stringify(data));
        emitter.emit(key);
      }
    },
    [key]
  );
  return [state, setValue] as const;
};

const defaultVersion = { version: 1, versions: 1 };
let version = defaultVersion;
export const useLocalStorageVersion = () => {
  const [legacyVersion] = useLocalStorage('version', defaultVersion);
  const [bracket] = useBracket();
  const [v, setVersion] = useLocalStorage(
    `version-${bracket.key}`,
    bracket.key === 'Bracket 2019' ? legacyVersion : defaultVersion
  );
  version = v;
  return [v, setVersion] as const;
};

export default <Value extends StorableValue>(
  key: string,
  initialValue: Value
) => useLocalStorage(key, initialValue, version);
