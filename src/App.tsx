import React from 'react';
import ForkWrapper from './ForkWrapper';
import useLocalStorage, { useLocalStorageVersion } from './useLocalStorage';
import _ from 'lodash';
import ForkItem from './ForkItem';
import { useIsSmall, useSegmentWidth } from './useScreenSize';
import { useBracket, bracketKeys } from 'brackets';

const initialSelected: Array<unknown> = [];
export default () => {
  const [bracket, setBracket] = useBracket();
  const [{ version, versions }, setVersion] = useLocalStorageVersion();
  const [selected, setSelected] = useLocalStorage<Array<unknown>>(
    bracket.directors.map(o => o.name).join(),
    initialSelected
  );

  const [winner, setWinner] = useLocalStorage('all-winner', '');
  const isSmall = useIsSmall();
  const segmentWidth = useSegmentWidth();

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

        <label htmlFor="bracket">bracket</label>
        <select
          id="bracket"
          onChange={event => setBracket(event.target.value as any)}
          value={bracket.key}
        >
          {bracketKeys.map(key => (
            <option key={key}>{key}</option>
          ))}
        </select>
      </div>
      <ForkWrapper
        onSelect={setWinner}
        options={bracket.directors}
        right={undefined}
      />
      <div
        style={{
          width: segmentWidth,
          borderBottom: '2px solid white',
        }}
      >
        <ForkItem
          onSelect={undefined}
          style={undefined}
          right={undefined}
          picked={winner}
          correctValue={
            bracket.winnerLookup[bracket.directors.map(o => o.name).join()]
          }
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
        right={undefined}
        onSelect={(value: any) => setSelected([value, selected[1]])}
        options={bracket.directors.slice(0, bracket.directors.length / 2)}
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
          <br />
          <label htmlFor="bracket">bracket</label>
          <select
            id="bracket"
            onChange={event => setBracket(event.target.value as any)}
            value={bracket.key}
          >
            {bracketKeys.map(key => (
              <option key={key}>{key}</option>
            ))}
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
                style={undefined}
                right={undefined}
                onSelect={setWinner}
                picked={selected[0]}
                correctValue={
                  bracket.winnerLookup[
                    bracket.directors
                      .slice(0, bracket.directors.length / 2)
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
                style={undefined}
                right
                onSelect={setWinner}
                picked={selected[1]}
                correctValue={
                  bracket.winnerLookup[
                    bracket.directors
                      .slice(-bracket.directors.length / 2)
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
            onSelect={undefined}
            style={undefined}
            right={undefined}
            picked={winner}
            correctValue={
              bracket.winnerLookup[bracket.directors.map(o => o.name).join()]
            }
          />
        </div>
      </div>
      <ForkWrapper
        onSelect={(value: any) => setSelected([selected[0], value])}
        right
        options={bracket.directors.slice(-bracket.directors.length / 2)}
      />
    </div>
  );
};
