import React from 'react';
import ForkItem from './ForkItem';

export default ({ picks, style, right, onSelect, correct, poll }) => {
  return (
    <div
      style={{
        width: 170,
        textAlign: 'center',
        textTransform: 'uppercase',
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
          onSelect={onSelect}
          picked={picks[0]}
          correctValue={correct[0]}
          style={{
            position: 'absolute',
            top: 0,
            transform: 'translateY(-120%)',
          }}
        />
        <ForkItem
          right={right}
          onSelect={onSelect}
          picked={picks[1]}
          correctValue={correct[1]}
        />
      </div>
    </div>
  );
};
