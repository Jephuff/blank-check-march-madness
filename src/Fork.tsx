import React, { CSSProperties } from 'react';
import { ForkItem } from './ForkItem';
import { useSegmentWidth } from './useScreenSize';
import { useBracketSelection, Data } from 'brackets';
import { Options } from 'allOptions';

export const Fork: React.FC<{
  picks?: [Options | undefined, Options | undefined];
  options?: [Data, Data];
  style?: CSSProperties;
  right?: boolean;
  selectionKey: string;
}> = ({ picks, style, right, selectionKey, options }) => {
  const [, setSelected] = useBracketSelection(selectionKey);
  const segmentWidth = useSegmentWidth();
  return (
    <div
      style={{
        width: segmentWidth,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          borderTop: '2px solid white',
          borderRight: right ? 'none' : '2px solid white',
          borderLeft: right ? '2px solid white' : 'none',
          borderBottom: '2px solid white',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          minHeight: 50,
          height: '100%',
          position: 'relative',
        }}
      >
        <ForkItem
          right={right}
          onSelect={setSelected}
          picked={picks?.[0]}
          data={options?.[0]}
          style={{
            position: 'absolute',
            top: 0,
            transform: 'translateY(-120%)',
          }}
        />
        <ForkItem
          right={right}
          onSelect={setSelected}
          picked={picks?.[1]}
          data={options?.[1]}
        />
      </div>
    </div>
  );
};
