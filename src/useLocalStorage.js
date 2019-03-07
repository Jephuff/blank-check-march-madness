import { useState, useEffect } from 'react';

function parseValue(k, initialValue, versionData) {
  let data = null;
  let cur = versionData ? versionData.version : 1;
  while (!data && cur > 0) {
    data = window.localStorage.getItem(versionData ? `${k}-${cur}` : k);
    cur -= 1;
  }

  if (data) {
    return JSON.parse(data);
  } else {
    return initialValue;
  }
}

const useLocalStorage = (k, initialValue, versionData) => {
  const key = versionData ? `${k}-${versionData.version}` : k;
  const [state, setState] = useState(() =>
    parseValue(k, initialValue, versionData)
  );

  useEffect(() => {
    setState(parseValue(k, initialValue, versionData));
  }, [key]);

  return [
    state,
    data => {
      if (typeof data === 'function') {
        setState(s => {
          const newState = data(s);
          window.localStorage.setItem(key, JSON.stringify(newState));
          return newState;
        });
      } else {
        window.localStorage.setItem(key, JSON.stringify(data));
        setState(data);
      }
    },
  ];
};

let version = { version: 1, versions: 1 };
export const useLocalStorageVersion = () => {
  const [v, setVersion] = useLocalStorage('version', version);
  version = v;
  return [v, setVersion];
};

export default (key, initialValue) => {
  return useLocalStorage(key, initialValue, version);
};
