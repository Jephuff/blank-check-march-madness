function skipTrivia(content, index) {
  let cursor = index;

  while (cursor < content.length) {
    const char = content[cursor];

    if (/\s/.test(char)) {
      cursor++;
      continue;
    }

    if (content.startsWith('//', cursor)) {
      const nextLine = content.indexOf('\n', cursor + 2);
      cursor = nextLine === -1 ? content.length : nextLine + 1;
      continue;
    }

    if (content.startsWith('/*', cursor)) {
      const commentEnd = content.indexOf('*/', cursor + 2);
      if (commentEnd === -1) {
        throw new Error('Unterminated block comment in bracket data');
      }
      cursor = commentEnd + 2;
      continue;
    }

    break;
  }

  return cursor;
}

function parseString(content, index) {
  const quote = content[index];
  let cursor = index + 1;
  let value = '';

  while (cursor < content.length) {
    const char = content[cursor];
    if (char === '\\') {
      value += char;
      cursor++;
      if (cursor < content.length) {
        value += content[cursor];
        cursor++;
      }
      continue;
    }

    if (char === quote) {
      return {
        type: 'string',
        value,
        start: index,
        end: cursor + 1,
      };
    }

    value += char;
    cursor++;
  }

  throw new Error('Unterminated string in bracket data');
}

function parseIdentifier(content, index) {
  let cursor = index;
  while (cursor < content.length && /[A-Za-z0-9_$]/.test(content[cursor])) {
    cursor++;
  }

  if (cursor === index) {
    throw new Error(`Expected identifier at index ${index}`);
  }

  return {
    type: 'identifier',
    value: content.slice(index, cursor),
    start: index,
    end: cursor,
  };
}

function parseArray(content, index) {
  let cursor = skipTrivia(content, index + 1);
  const elements = [];

  while (cursor < content.length && content[cursor] !== ']') {
    const element = parseValue(content, cursor);
    elements.push(element);
    cursor = skipTrivia(content, element.end);

    if (content[cursor] === ',') {
      cursor = skipTrivia(content, cursor + 1);
      continue;
    }

    if (content[cursor] !== ']') {
      throw new Error(`Expected ',' or ']' at index ${cursor}`);
    }
  }

  if (content[cursor] !== ']') {
    throw new Error('Unterminated array in bracket data');
  }

  return {
    type: 'array',
    elements,
    start: index,
    end: cursor + 1,
  };
}

function parseObject(content, index) {
  let cursor = skipTrivia(content, index + 1);
  const properties = [];

  while (cursor < content.length && content[cursor] !== '}') {
    const keyNode =
      content[cursor] === "'" || content[cursor] === '"'
        ? parseString(content, cursor)
        : parseIdentifier(content, cursor);

    const key = keyNode.value;
    cursor = skipTrivia(content, keyNode.end);

    if (content[cursor] !== ':') {
      throw new Error(`Expected ':' after property ${key} at index ${cursor}`);
    }

    cursor = skipTrivia(content, cursor + 1);
    const initializer = parseValue(content, cursor);
    properties.push({
      type: 'property',
      name: key,
      initializer,
      start: keyNode.start,
      end: initializer.end,
    });

    cursor = skipTrivia(content, initializer.end);
    if (content[cursor] === ',') {
      cursor = skipTrivia(content, cursor + 1);
      continue;
    }

    if (content[cursor] !== '}') {
      throw new Error(`Expected ',' or '}' at index ${cursor}`);
    }
  }

  if (content[cursor] !== '}') {
    throw new Error('Unterminated object in bracket data');
  }

  return {
    type: 'object',
    properties,
    start: index,
    end: cursor + 1,
  };
}

function parseValue(content, index) {
  const cursor = skipTrivia(content, index);
  const char = content[cursor];

  if (char === '{') return parseObject(content, cursor);
  if (char === '[') return parseArray(content, cursor);
  if (char === "'" || char === '"') return parseString(content, cursor);
  if (/[A-Za-z_$]/.test(char)) return parseIdentifier(content, cursor);

  throw new Error(`Unsupported value at index ${cursor}`);
}

function findDataObjectStart(content) {
  const dataMatch = /const\s+data\b[\s\S]*?=/.exec(content);
  if (!dataMatch) {
    throw new Error('Could not find `const data =` in bracket data');
  }

  const valueStart = skipTrivia(content, dataMatch.index + dataMatch[0].length);
  if (content[valueStart] !== '{') {
    throw new Error('Bracket data does not start with an object literal');
  }

  return valueStart;
}

function parseSource(content) {
  return parseObject(content, findDataObjectStart(content));
}

export function normalizeName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function normalizedNamesMatch(a, b) {
  return a === b || a.includes(b) || b.includes(a);
}

function getStringValue(expression) {
  return expression?.type === 'string' ? expression.value : null;
}

function getObjectProperty(node, name) {
  return node.properties.find((property) => property.name === name);
}

function getWinner(node) {
  const property = getObjectProperty(node, 'winner');
  return property ? getStringValue(property.initializer) : null;
}

function getPollValue(node) {
  const property = getObjectProperty(node, 'poll');
  return property ? getStringValue(property.initializer) : null;
}

function getWinnerProperty(node) {
  return getObjectProperty(node, 'winner');
}

function getOptionsProperty(node) {
  const property = getObjectProperty(node, 'options');
  if (!property || property.initializer.type !== 'array') {
    return null;
  }
  return property;
}

function getNodeIndent(content, node) {
  const lineStart = content.lastIndexOf('\n', node.start) + 1;
  return content.slice(lineStart, node.start);
}

function getLineStart(content, node) {
  return content.lastIndexOf('\n', node.start) + 1;
}

function getLineEnd(content, node) {
  const lineEnd = content.indexOf('\n', node.end);
  return lineEnd === -1 ? content.length : lineEnd + 1;
}

function replaceRange(content, start, end, replacement) {
  return `${content.slice(0, start)}${replacement}${content.slice(end)}`;
}

function applyPollAtObject(content, objectNode, url) {
  const pollProperty = getObjectProperty(objectNode, 'poll');
  if (pollProperty) {
    if (getStringValue(pollProperty.initializer) === url) {
      return { content, updated: false, reason: 'already-recorded' };
    }
    const indent = getNodeIndent(content, pollProperty);
    const replacement = `${indent}poll: '${url}',\n`;
    return {
      content: replaceRange(
        content,
        getLineStart(content, pollProperty),
        getLineEnd(content, pollProperty),
        replacement
      ),
      updated: true,
    };
  }

  const optionsProperty = getOptionsProperty(objectNode);
  if (!optionsProperty) {
    return { content, updated: false, reason: 'missing-options' };
  }

  const indent = getNodeIndent(content, optionsProperty);
  const insertion = `${indent}poll: '${url}',\n`;
  return {
    content: replaceRange(
      content,
      getLineStart(content, optionsProperty),
      getLineStart(content, optionsProperty),
      insertion
    ),
    updated: true,
  };
}

function applyWinnerAtObject(content, objectNode, winner) {
  const winnerProperty = getWinnerProperty(objectNode);
  if (winnerProperty) {
    if (getStringValue(winnerProperty.initializer) === winner) {
      return { content, updated: false, reason: 'already-recorded' };
    }
    const indent = getNodeIndent(content, winnerProperty);
    const replacement = `${indent}winner: '${winner}',\n`;
    return {
      content: replaceRange(
        content,
        getLineStart(content, winnerProperty),
        getLineEnd(content, winnerProperty),
        replacement
      ),
      updated: true,
    };
  }

  const pollProperty = getObjectProperty(objectNode, 'poll');
  if (!pollProperty) {
    return { content, updated: false, reason: 'missing-poll' };
  }

  const indent = getNodeIndent(content, pollProperty);
  const insertion = `${indent}winner: '${winner}',\n`;
  return {
    content: replaceRange(
      content,
      getLineStart(content, pollProperty),
      getLineStart(content, pollProperty),
      insertion
    ),
    updated: true,
  };
}

function walkMatchupObjects(content) {
  const source = parseSource(content);
  const matchups = [];

  function visit(node) {
    if (node.type === 'object') {
      const optionsProperty = getOptionsProperty(node);
      if (optionsProperty) {
        const elements = optionsProperty.initializer.elements;
        if (elements.length === 2) {
          const poll = getPollValue(node);
          const winner = getWinner(node);
          const leafOptions = elements.map(getStringValue);

          if (leafOptions.every(Boolean)) {
            matchups.push({
              node,
              type: 'leaf',
              poll,
              winner,
              options: leafOptions,
            });
          } else if (elements.every((element) => element.type === 'object')) {
            const childWinners = elements.map(getWinner);
            matchups.push({
              node,
              type: 'internal',
              poll,
              winner,
              childWinners,
            });
          }
        }
      }

      for (const property of node.properties) {
        visit(property.initializer);
      }
      return;
    }

    if (node.type === 'array') {
      for (const element of node.elements) {
        visit(element);
      }
    }
  }

  visit(source);
  return matchups;
}

export function applyPollUrlByMatch(content, poll) {
  const expected = poll.options.map(normalizeName);

  for (const matchup of walkMatchupObjects(content)) {
    const candidates =
      matchup.type === 'leaf' ? matchup.options : matchup.childWinners;
    if (!candidates || candidates.some((value) => !value)) continue;

    const normalized = candidates.map(normalizeName);
    const matches =
      (normalizedNamesMatch(normalized[0], expected[0]) &&
        normalizedNamesMatch(normalized[1], expected[1])) ||
      (normalizedNamesMatch(normalized[0], expected[1]) &&
        normalizedNamesMatch(normalized[1], expected[0]));

    if (!matches) continue;
    return applyPollAtObject(content, matchup.node, poll.url);
  }

  return { content, updated: false, reason: 'no-match' };
}

function getMatchupCandidates(matchup) {
  return matchup.type === 'leaf' ? matchup.options : matchup.childWinners;
}

function resolveWinnerValue(content, url, winner) {
  const matchup = walkMatchupObjects(content).find((item) => item.poll === url);
  if (!matchup) return winner;

  const candidates = getMatchupCandidates(matchup);
  if (!candidates || candidates.some((value) => !value)) {
    return winner;
  }

  const normalizedWinner = normalizeName(winner);
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeName(candidate);
    if (normalizedNamesMatch(normalizedCandidate, normalizedWinner)) {
      return candidate;
    }
  }

  return winner;
}

export function applyWinnerByUrl(content, url, winner) {
  const matchup = walkMatchupObjects(content).find((item) => item.poll === url);
  if (!matchup) {
    return { content, updated: false, reason: 'no-match' };
  }

  const resolvedWinner = resolveWinnerValue(content, url, winner);
  return applyWinnerAtObject(content, matchup.node, resolvedWinner);
}

export function clearMatchupByPollUrl(content, url) {
  const matchup = walkMatchupObjects(content).find((item) => item.poll === url);
  if (!matchup) {
    return { content, updated: false, reason: 'no-match' };
  }

  const removals = [];
  const pollProperty = getObjectProperty(matchup.node, 'poll');
  if (pollProperty) {
    removals.push(pollProperty);
  }

  const winnerProperty = getWinnerProperty(matchup.node);
  if (winnerProperty) {
    removals.push(winnerProperty);
  }

  const ranges = removals
    .map((property) => ({
      start: getLineStart(content, property),
      end: getLineEnd(content, property),
    }))
    .sort((a, b) => b.start - a.start);

  let nextContent = content;
  for (const range of ranges) {
    nextContent = replaceRange(nextContent, range.start, range.end, '');
  }

  return { content: nextContent, updated: removals.length > 0 };
}

function isReadyForPoll(matchup) {
  if (matchup.poll) return false;
  if (matchup.type === 'leaf') return true;
  return matchup.childWinners.every(Boolean);
}

export function applyNextPollUrl(content, url) {
  for (const matchup of walkMatchupObjects(content)) {
    if (!isReadyForPoll(matchup)) continue;
    return applyPollAtObject(content, matchup.node, url);
  }

  return { content, updated: false, reason: 'no-match' };
}
