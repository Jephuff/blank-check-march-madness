import React from 'react';
import ForkWrapper from './ForkWrapper';
import useLocalStorage, { useLocalStorageVersion } from './useLocalStorage';
import _ from 'lodash';
import { ForkItem } from './ForkItem';
import { useIsSmall, useSegmentWidth } from './useScreenSize';
import { useBracket, bracketKeys, Director } from 'brackets';

const initialSelected: Array<Director> = [];
export default () => {
  const [bracket, setBracket] = useBracket();
  const [{ version, versions }, setVersion] = useLocalStorageVersion();
  const [selected, setSelected] = useLocalStorage<Array<Director>>(
    bracket.directors.map(o => o.name).join(),
    initialSelected
  );

  const [winner, setWinner] = useLocalStorage<Director | undefined>(
    `${bracket.key}-all-winner`,
    undefined
  );
  const isSmall = useIsSmall();
  const segmentWidth = useSegmentWidth();

  const bracketSelector = (
    <div style={{ display: 'flex' }}>
      <div style={{ padding: 5 }}>bracket:</div>
      {bracketKeys.map(key => (
        <div
          style={{
            padding: 5,
            cursor: 'pointer',
            borderRadius: 2,
            ...(key === bracket.key
              ? { background: 'white', color: 'black' }
              : {}),
          }}
          key={key}
          onClick={() => setBracket(key)}
        >
          {key}
        </div>
      ))}
    </div>
  );
  const controls = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label htmlFor="version" style={{ padding: 5 }}>
        version
      </label>
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
  );
  return isSmall ? (
    <div
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        verticalAlign: 'middle',
        alignItems: 'center',
        fontSize: '1.1vw',
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {bracketSelector}
        {controls}
      </div>
      <ForkWrapper onSelect={setWinner} options={bracket.directors} />
      <div
        style={{
          width: segmentWidth,
          borderBottom: '2px solid white',
        }}
      >
        <ForkItem
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
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 5,
        }}
      >
        {bracketSelector}
      </div>
      <ForkWrapper
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
        {controls}
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
