import React from 'react';
import Fork from './Fork';
import useLocalStorage from './useLocalStorage';
import { useBracket } from 'brackets';

const initialSelected = [];
const ForkWrapper = ({ options, right, onSelect }) => {
  const [bracket] = useBracket();
  const [selected, setSelected] = useLocalStorage(
    options.map(o => o.name).join(),
    initialSelected
  );
  if (options.length <= 2) {
    return (
      <Fork
        picks={options}
        right={right}
        style={{ paddingTop: 20, paddingBottom: 20 }}
        onSelect={onSelect}
        correct={[]}
        poll={bracket.winnerLookup[options.map(o => o.name).join()]}
      />
    );
  }
  const forks = (
    <React.Fragment>
      <ForkWrapper
        options={options.slice(0, options.length / 2)}
        right={right}
        onSelect={value => setSelected([value, selected[1]])}
      />
      <ForkWrapper
        options={options.slice(-options.length / 2)}
        right={right}
        onSelect={value => setSelected([selected[0], value])}
      />
    </React.Fragment>
  );
  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      {!right && <div>{forks}</div>}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Fork
          picks={selected}
          style={{ height: '50%' }}
          right={right}
          onSelect={onSelect}
          poll={bracket.winnerLookup[options.map(o => o.name).join()]}
          correct={[
            bracket.winnerLookup[
              options
                .slice(0, options.length / 2)
                .map(o => o.name)
                .join()
            ],
            bracket.winnerLookup[
              options
                .slice(-options.length / 2)
                .map(o => o.name)
                .join()
            ],
          ]}
        />
      </div>
      {right && <div>{forks}</div>}
    </div>
  );
};

export default ForkWrapper;
