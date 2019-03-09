import React from 'react';
import ForkWrapper from './ForkWrapper';
import useLocalStorage, { useLocalStorageVersion } from './useLocalStorage';
import { winnerLookup } from './options';
import directors from './directors.json';
import _ from 'lodash';
import ForkItem from './ForkItem';
import { useIsSmall, useSegmentWidth } from './useScreenSize';

export default () => {
  const [{ version, versions }, setVersion] = useLocalStorageVersion();
  const [selected, setSelected] = useLocalStorage(
    directors.map(o => o.name).join(),
    []
  );

  const [winner, setWinner] = useLocalStorage('all-winner', '');
  const isSmall = useIsSmall();
  const segmentWidth = useSegmentWidth();

  console.log(isSmall);

  return isSmall ? (
    <div
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        verticalAlign: 'middle',
        alignItems: 'center',
        fontSize: '1.1vw',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          position: 'absolute',
          top: 10,
          right: 10,
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
      <ForkWrapper onSelect={setWinner} options={directors} />
      <div
        style={{
          width: segmentWidth,
          borderBottom: '2px solid white',
        }}
      >
        <ForkItem
          picked={winner}
          correctValue={winnerLookup[directors.map(o => o.name).join()]}
        />
      </div>
    </div>
  ) : (
    <div
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        verticalAlign: 'middle',
        fontSize: '0.7vw',
      }}
    >
      <ForkWrapper
        onSelect={value => setSelected([value, selected[1]])}
        options={directors.slice(0, directors.length / 2)}
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
              width: segmentWidth,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                textAlign: 'center',
                left: 0,
                right: 2,
                borderBottom: '2px solid white',
              }}
            >
              <ForkItem
                onSelect={setWinner}
                picked={selected[0]}
                correctValue={
                  winnerLookup[
                    directors
                      .slice(0, directors.length / 2)
                      .map(o => o.name)
                      .join()
                  ]
                }
              />
            </div>
          </div>
          <div
            style={{
              width: segmentWidth,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                textAlign: 'center',
                left: 2,
                right: 0,
                borderBottom: '2px solid white',
              }}
            >
              <ForkItem
                right
                onSelect={setWinner}
                picked={selected[1]}
                correctValue={
                  winnerLookup[
                    directors
                      .slice(-directors.length / 2)
                      .map(o => o.name)
                      .join()
                  ]
                }
              />
            </div>
          </div>
        </div>
        <div
          style={{
            width: segmentWidth,
            borderBottom: '2px solid white',
          }}
        >
          <ForkItem
            picked={winner}
            correctValue={winnerLookup[directors.map(o => o.name).join()]}
          />
        </div>
      </div>
      <ForkWrapper
        onSelect={value => setSelected([selected[0], value])}
        right
        options={directors.slice(-directors.length / 2)}
      />
    </div>
  );
};
