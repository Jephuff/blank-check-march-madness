import React, { CSSProperties } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPauseCircle,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi';
import twitter from './twitter.png';
import { Director } from 'brackets';

type CorrectValue =
  | {
      possible?: undefined;
      name: string;
      poll?: string;
    }
  | {
      name?: undefined;
      possible: Array<Director>;
      poll?: string;
    };

type OnSelect = (v: Director) => void;

const StatusIcon: React.FC<{
  correctValue?: CorrectValue;
  picked: Director;
}> = ({ correctValue, picked }) => {
  if (correctValue) {
    if (correctValue.name === picked.name) {
      return <FiCheckCircle color="green" style={{ margin: 1 }} />;
    } else if (
      correctValue.name ||
      correctValue.possible?.every(p => p.name !== picked.name)
    ) {
      return <FiXCircle color="red" style={{ margin: 1 }} />;
    } else if (correctValue.poll) {
      return <FiClock color="yellow" style={{ margin: 1 }} />;
    } else {
      return <FiPauseCircle color="white" style={{ margin: 1 }} />;
    }
  }
  return null;
};

const PollLink: React.FC<{ correctValue?: CorrectValue }> = ({
  correctValue,
}) => {
  return (
    (correctValue && correctValue.poll && (
      <a
        target="_BLANK"
        rel="noopener noreferrer"
        href={correctValue.poll}
        style={{ padding: 1 }}
      >
        <img src={twitter} style={{ width: '1em' }} alt="twitter poll" />
      </a>
    )) ||
    null
  );
};

const Select: React.FC<{
  picked: Director;
  right?: boolean;
  onSelect?: OnSelect;
}> = ({ picked, right, onSelect }) => {
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
};

export const ForkItem: React.FC<{
  onSelect?: OnSelect;
  picked?: Director;
  correctValue?: CorrectValue;
  right?: boolean;
  style?: CSSProperties;
}> = ({ onSelect, picked, correctValue, style, right }) => {
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
          href={
            picked.imdb.match(/^http/)
              ? picked.imdb
              : `https://www.imdb.com/name/${picked.imdb}`
          }
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
