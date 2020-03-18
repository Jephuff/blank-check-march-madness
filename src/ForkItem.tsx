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
import { Data } from 'brackets';
import { Options, allOptions } from 'allOptions';

type OnSelect = (v: Options) => void;

function isStillPossible(picked: string, data?: Data): boolean {
  const option1 = data?.options[0];
  const option2 = data?.options[1];
  if (data?.winner) {
    return data?.winner === picked;
  } else {
    return (
      (typeof option1 !== 'string' && option1
        ? isStillPossible(picked, option1)
        : option1 === picked) ||
      (typeof option2 !== 'string' && option2
        ? isStillPossible(picked, option2)
        : option2 === picked)
    );
  }
}

const StatusIcon: React.FC<{
  picked: string;
  data?: Data;
}> = ({ picked, data }) => {
  if (!data) return null;

  if (data.winner === picked) {
    return <FiCheckCircle color="green" style={{ margin: 1 }} />;
  } else if (!isStillPossible(picked, data)) {
    return <FiXCircle color="red" style={{ margin: 1 }} />;
  } else if (data.poll) {
    return <FiClock color="yellow" style={{ margin: 1 }} />;
  } else {
    return <FiPauseCircle color="white" style={{ margin: 1 }} />;
  }
};

const PollLink: React.FC<{ data?: Data }> = ({ data }) => {
  return (
    (data?.poll && (
      <a
        target="_BLANK"
        rel="noopener noreferrer"
        href={
          data.poll.match(/^http/)
            ? data.poll
            : `https://twitter.com/blankcheckpod/status/${data.poll}`
        }
        style={{ padding: 1 }}
      >
        <img src={twitter} style={{ width: '1em' }} alt="twitter poll" />
      </a>
    )) ||
    null
  );
};

const Select: React.FC<{
  picked: Options;
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
  picked?: Options;
  right?: boolean;
  style?: CSSProperties;
  data?: Data;
}> = ({ onSelect, picked, style, right, data }) => {
  if (!picked) return null;
  const icons = [
    <StatusIcon data={data} key="1" picked={picked} />,
    <PollLink key="2" data={data} />,
    <Select key="3" right={right} onSelect={onSelect} picked={picked} />,
  ];
  const directorData = allOptions[picked];
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
      {directorData?.imdb ? (
        <a
          target="_BLANK"
          rel="noopener noreferrer"
          href={
            directorData.imdb.match(/^http/)
              ? directorData.imdb
              : `https://www.imdb.com/name/${directorData.imdb}`
          }
          style={{
            color: 'white',
            textDecoration: 'none',
            margin: 1,
            textTransform: 'uppercase',
          }}
        >
          {picked}
        </a>
      ) : (
        picked
      )}
      {!right && icons}
    </div>
  );
};
