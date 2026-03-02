import { useEffect } from 'react';
import ForkWrapper from './ForkWrapper';
import { useLocalStorageVersion } from './useLocalStorage';
import _ from 'lodash';
import { ForkItem } from './ForkItem';
import { useIsSmall, useSegmentWidth } from './useScreenSize';
import {
  useBracketKey,
  Bracket,
  useBracketSelection,
  useBracketData,
} from 'brackets';

const baseKey = '0';
const LIVE_YEAR = '2026';

// Collect all leaf matchup nodes from the bracket tree
function collectLeaves(node: any): Array<{ poll?: string; winner?: string }> {
  if (typeof node.options[0] === 'string') return [node];
  return [...collectLeaves(node.options[0]), ...collectLeaves(node.options[1])];
}

export const App = () => {
  const [bracketKey, setBracket] = useBracketKey();
  const bracket = useBracketData({ bracketKey });
  const [{ version, versions }, setVersion] = useLocalStorageVersion();

  const [winnerSelection, setWinnerSelection] = useBracketSelection(baseKey);
  const [selected1] = useBracketSelection(`${baseKey}-0`);
  const [selected2] = useBracketSelection(`${baseKey}-1`);

  const isSmall = useIsSmall();
  const segmentWidth = useSegmentWidth();

  const bracketName = Bracket[bracketKey];
  const isPatreon = bracketName.includes('Patreon');
  const currentYear = bracketName.match(/\d{4}/)?.[0] ?? '';

  const isLiveBracket = currentYear === LIVE_YEAR;
  const isAfter9am = new Date().getHours() >= 9;
  const leaves = isLiveBracket ? collectLeaves(bracket) : [];
  // Determine today's and yesterday's matchups by calendar day (Day 1 = March 1)
  const tournamentStart = new Date(`${LIVE_YEAR}-03-01T00:00:00`);
  const dayIndex = Math.floor(
    (Date.now() - tournamentStart.getTime()) / 86400000
  );
  const todayLeaf = leaves[dayIndex] as
    | { poll?: string; winner?: string }
    | undefined;
  const yesterdayLeaf = leaves[dayIndex - 1] as
    | { poll?: string; winner?: string }
    | undefined;
  const missingPoll = Boolean(todayLeaf && !todayLeaf.poll);
  const missingWinner = Boolean(yesterdayLeaf && !yesterdayLeaf.winner);
  const showRefresh =
    isLiveBracket && isAfter9am && (missingPoll || missingWinner);
  const refreshTitle = missingPoll
    ? "Today's poll may be available"
    : "Yesterday's winner may be available";

  // Auto-reload once per day at/after 9:30am if data is missing
  useEffect(() => {
    if (!showRefresh) return;
    const now = new Date();
    if (now.getHours() < 9 || (now.getHours() === 9 && now.getMinutes() < 30))
      return;
    const todayKey = now.toDateString();
    if (localStorage.getItem('autoRefreshDate') === todayKey) return;
    localStorage.setItem('autoRefreshDate', todayKey);
    window.location.reload();
  }, [showRefresh]);

  const years = [
    ...new Set(
      (Object.values(Bracket) as Array<string | number>)
        .filter((k): k is number => typeof k === 'number')
        .map((k) => (Bracket[k] as string).match(/\d{4}/)?.[0])
        .filter((y): y is string => Boolean(y))
    ),
  ];

  const lookupBracket = (name: string): Bracket | undefined => {
    const idx = (Bracket as unknown as Record<string, number>)[name];
    return typeof idx === 'number' ? idx : undefined;
  };

  const hasPatreon =
    lookupBracket(`Bracket ${currentYear} Patreon`) !== undefined;

  const bracketSelector = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label htmlFor="bracket-year" style={{ padding: 5 }}>
        bracket
      </label>
      <select
        id="bracket-year"
        value={currentYear}
        onChange={(e) => {
          const newYear = e.target.value;
          const patreon = lookupBracket(`Bracket ${newYear} Patreon`);
          const main = lookupBracket(`Bracket ${newYear}`)!;
          setBracket(isPatreon && patreon !== undefined ? patreon : main);
        }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      {hasPatreon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginLeft: 8,
          }}
        >
          {(['main', 'patreon'] as const).map((mode) => (
            <label
              key={mode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="radio"
                name="bracket-mode"
                checked={mode === 'patreon' ? isPatreon : !isPatreon}
                onChange={() => {
                  const key =
                    mode === 'patreon'
                      ? lookupBracket(`Bracket ${currentYear} Patreon`)!
                      : lookupBracket(`Bracket ${currentYear}`)!;
                  setBracket(key);
                }}
              />
              {mode}
            </label>
          ))}
        </div>
      )}
      {showRefresh && (
        <button
          onClick={() => window.location.reload()}
          title={refreshTitle}
          style={{ marginLeft: 8 }}
        >
          ↺
        </button>
      )}
    </div>
  );
  const controls = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label htmlFor="version" style={{ padding: 5 }}>
        version
      </label>
      <select
        id="version"
        onChange={(event) => {
          const value = event.target.value;
          if (value === 'new') {
            setVersion({ versions: versions + 1, version: versions + 1 });
          } else {
            setVersion({ versions, version: Number(event.target.value) });
          }
        }}
        value={version}
      >
        {_.range(1, versions + 1).map((k) => (
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
      <ForkWrapper data={bracket} selectionKey={baseKey} />
      <div
        style={{
          width: segmentWidth,
          borderBottom: '2px solid white',
        }}
      >
        <ForkItem data={bracket} picked={winnerSelection} />
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
      <ForkWrapper data={bracket.options[0]} selectionKey={`${baseKey}-0`} />
      <div
        style={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-around',
        }}
      >
        {bracketSelector}
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
                data={bracket.options[0]}
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
                data={bracket.options[1]}
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
          <ForkItem picked={winnerSelection} data={bracket} />
        </div>
        {/* Spacer to balance bracket selector */}
        <div />
      </div>
      <ForkWrapper
        right
        data={bracket.options[1]}
        selectionKey={`${baseKey}-1`}
      />
    </div>
  );
};
