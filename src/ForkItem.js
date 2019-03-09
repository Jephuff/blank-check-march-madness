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
      return <FiCheckCircle color="green" style={{ margin: 1 }} />;
    } else if (
      correctValue.name ||
      correctValue.possible.every(p => p.name !== picked.name)
    ) {
      return <FiXCircle color="red" style={{ margin: 1 }} />;
    } else if (correctValue.poll) {
      return <FiClock color="yellow" style={{ margin: 1 }} />;
    } else {
      return <FiPauseCircle color="white" style={{ margin: 1 }} />;
    }
  }
  return null;
}

function PollLink({ correctValue }) {
  return (
    (correctValue && correctValue.poll && (
      <a
        target="_BLANK"
        rel="noopener noreferrer"
        href={correctValue.poll}
        style={{ padding: 1 }}
      >
        <img
          src="https://www.samaritans.org/sites/default/files/branch/twitter_logo_bird_transparent_png.png"
          style={{ width: '0.7vw' }}
          alt="twitter poll"
        />
      </a>
    )) ||
    null
  );
}

function Select({ picked, right, onSelect }) {
  if (!onSelect) {
    return null;
  } else if (right) {
    return (
      <FiArrowLeft
        style={{ cursor: picked ? 'pointer' : 'default', margin: 1 }}
        onClick={() => onSelect(picked)}
      />
    );
  } else {
    return (
      <FiArrowRight
        style={{ cursor: picked ? 'pointer' : 'default', margin: 1 }}
        onClick={() => onSelect(picked)}
      />
    );
  }
}

export default ({ onSelect, picked, correctValue, style, right }) => {
  if (!picked) return null;
  const icons = [
    <StatusIcon key="1" correctValue={correctValue} picked={picked} />,
    <PollLink key="2" correctValue={correctValue} />,
    <Select key="3" right={right} onSelect={onSelect} picked={picked} />,
  ];
  return (
    <div
      style={{
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {right && icons.reverse()}
      {picked.imdb ? (
        <a
          target="_BLANK"
          rel="noopener noreferrer"
          href={`https://www.imdb.com/name/${picked.imdb}`}
          style={{
            color: 'white',
            textDecoration: 'none',
            margin: 1,
            textTransform: 'uppercase',
          }}
        >
          {picked.name}
        </a>
      ) : (
        picked.name
      )}
      {!right && icons}
    </div>
  );
};
