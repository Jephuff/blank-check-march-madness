import React from 'react';
import ForkWrapper from './ForkWrapper';
import { useLocalStorageVersion } from './useLocalStorage';
import _ from 'lodash';
import { ForkItem } from './ForkItem';
import { useIsSmall, useSegmentWidth } from './useScreenSize';
import { useBracket, bracketKeys, useBracketSelection } from 'brackets';

const baseKey = '0';

export default () => {
  const [bracket, setBracket] = useBracket();
  const [{ version, versions }, setVersion] = useLocalStorageVersion();

  const [winnerSelection, setWinnerSelection] = useBracketSelection(baseKey);
  const [selected1] = useBracketSelection(`${baseKey}-0`);
  const [selected2] = useBracketSelection(`${baseKey}-1`);

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
      <ForkWrapper data={bracket.data} selectionKey={baseKey} />
      <div
        style={{
          width: segmentWidth,
          borderBottom: '2px solid white',
        }}
      >
        <ForkItem data={bracket.data} picked={winnerSelection} />
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
        data={bracket.data.options[0]}
        selectionKey={`${baseKey}-0`}
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
                onSelect={setWinnerSelection}
                picked={selected1}
                data={bracket.data.options[0]}
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
                onSelect={setWinnerSelection}
                picked={selected2}
                data={bracket.data.options[1]}
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
          <ForkItem picked={winnerSelection} data={bracket.data} />
        </div>
      </div>
      <ForkWrapper
        right
        data={bracket.data.options[1]}
        selectionKey={`${baseKey}-1`}
      />
    </div>
  );
};
