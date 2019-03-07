import React from 'react';
import ForkWrapper from './ForkWrapper';
import useLocalStorage, { useLocalStorageVersion } from './useLocalStorage';
import { options, winnerLookup } from './options';
import _ from 'lodash';
import ForkItem from './ForkItem';

export default () => {
  const [{ version, versions }, setVersion] = useLocalStorageVersion();
  const [selected, setSelected] = useLocalStorage('all', []);
  const [winner, setWinner] = useLocalStorage('all-winner', '');

  return (
    <div
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        verticalAlign: 'middle',
      }}
    >
      <ForkWrapper
        onSelect={value => setSelected([value, selected[1]])}
        options={options.slice(0, options.length / 2)}
      />
      <div
        style={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-around',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <label htmlFor="version">version</label>
          <select
            id="version"
            onChange={event => {
              const value = event.target.value;
              if (value === 'new') {
                setVersion({ versions: versions + 1, version: versions + 1 });
              } else {
                setVersion({ versions, version: Number(event.target.value) });
              }
            }}
            value={version}
          >
            {_.range(1, versions + 1).map(k => (
              <option key={k}>{k}</option>
            ))}
            <option>new</option>
          </select>
        </div>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              width: 150,
              borderBottom: '2px solid white',
              marginRight: 2,
              position: 'relative',
            }}
          >
            <ForkItem
              onSelect={setWinner}
              picked={selected[0]}
              style={{
                position: 'absolute',
                bottom: 0,
                textAlign: 'center',
                left: 0,
                right: 0,
              }}
              correctValue={
                winnerLookup[
                  options
                    .slice(0, options.length / 2)
                    .map(o => o.name)
                    .join()
                ]
              }
            />
          </div>
          <div
            style={{
              width: 150,
              marginLeft: 2,
              borderBottom: '2px solid white',
              position: 'relative',
            }}
          >
            <ForkItem
              right
              onSelect={setWinner}
              picked={selected[1]}
              style={{
                position: 'absolute',
                bottom: 0,
                textAlign: 'center',
                left: 0,
                right: 0,
              }}
              correctValue={
                winnerLookup[
                  options
                    .slice(-options.length / 2)
                    .map(o => o.name)
                    .join()
                ]
              }
            />
          </div>
        </div>
        <div
          style={{
            width: 150,
            borderBottom: '2px solid white',
          }}
        >
          <ForkItem
            picked={winner}
            correctValue={winnerLookup[options.map(o => o.name).join()]}
          />
        </div>
      </div>
      <ForkWrapper
        onSelect={value => setSelected([selected[0], value])}
        right
        options={options.slice(-options.length / 2)}
      />
    </div>
  );
};
