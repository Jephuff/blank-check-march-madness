import React from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPauseCircle,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi';

function StatusIcon({ correctValue, picked }) {
  if (correctValue) {
    if (correctValue.name === picked.name) {
      return <FiCheckCircle color="green" />;
    } else if (
      correctValue.name ||
      correctValue.possible.every(p => p.name !== picked.name)
    ) {
      return <FiXCircle color="red" />;
    } else if (correctValue.poll) {
      return <FiClock color="yellow" />;
    } else {
      return <FiPauseCircle color="white" />;
    }
  }
  return null;
}

function PollLink({ correctValue }) {
  return (
    (correctValue && correctValue.poll && (
      <a target="_BLANK" rel="noopener noreferrer" href={correctValue.poll}>
        <img
          src="https://www.samaritans.org/sites/default/files/branch/twitter_logo_bird_transparent_png.png"
          style={{ width: 15 }}
          alt="twitter poll"
        />
      </a>
    )) ||
    null
  );
}

export default ({ onSelect, picked, correctValue, style, right }) => {
  if (!picked) return null;
  return (
    <div
      style={{
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {onSelect && right && (
        <FiArrowLeft
          style={{ cursor: picked ? 'pointer' : 'default' }}
          onClick={() => onSelect(picked)}
        />
      )}
      {picked.imdb ? (
        <a
          target="_BLANK"
          rel="noopener noreferrer"
          href={`https://www.imdb.com/name/${picked.imdb}`}
          style={{ color: 'white', textDecoration: 'none' }}
        >
          {picked.name}
        </a>
      ) : (
        picked.name
      )}
      <StatusIcon correctValue={correctValue} picked={picked} />
      <PollLink correctValue={correctValue} />
      {onSelect && !right && (
        <FiArrowRight
          style={{ cursor: picked ? 'pointer' : 'default' }}
          onClick={() => onSelect(picked)}
        />
      )}
    </div>
  );
};
