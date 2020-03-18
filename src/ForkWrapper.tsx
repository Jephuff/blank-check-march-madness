import React from 'react';
import { Fork } from './Fork';
import { Data, useBracketSelection } from 'brackets';

function isLeafOptions(
  options: [Data | string, Data | string]
): options is [string, string] {
  return options.every(o => typeof o === 'string');
}

function isBracketOptions(
  options: [Data | string, Data | string]
): options is [Data, Data] {
  return options.every(o => typeof o !== 'string');
}

const ForkWrapper = function({
  data,
  right,
  selectionKey,
}: {
  right?: boolean;
  data: Data;
  selectionKey: string;
}) {
  const [selected1] = useBracketSelection(`${selectionKey}-0`);
  const [selected2] = useBracketSelection(`${selectionKey}-1`);
  let forks;
  if (isLeafOptions(data.options)) {
    return (
      <Fork
        selectionKey={selectionKey}
        picks={data.options}
        right={right}
        style={{ paddingTop: 20, paddingBottom: 20 }}
      />
    );
  } else if (isBracketOptions(data.options)) {
    forks = (
      <>
        <ForkWrapper
          data={data.options[0]}
          right={right}
          selectionKey={`${selectionKey}-0`}
        />
        <ForkWrapper
          data={data.options[1]}
          right={right}
          selectionKey={`${selectionKey}-1`}
        />
      </>
    );
  } else {
    throw new Error('what?');
  }

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      {!right && <div>{forks}</div>}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Fork
          selectionKey={selectionKey}
          picks={[selected1, selected2]}
          style={{ height: '50%' }}
          right={right}
          options={[data.options[0], data.options[1]]}
        />
      </div>
      {right && <div>{forks}</div>}
    </div>
  );
};

export default ForkWrapper;
