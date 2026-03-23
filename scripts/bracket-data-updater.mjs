import ts from 'typescript';

export function normalizeName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function parseSource(content) {
  return ts.createSourceFile(
    'bracket-data.ts',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
}

function getStringValue(expression) {
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.text;
  }
  return null;
}

function getObjectProperty(node, name) {
  return node.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === name
  );
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
  if (!property || !ts.isArrayLiteralExpression(property.initializer)) {
    return null;
  }
  return property;
}

function getNodeIndent(content, node) {
  const lineStart = content.lastIndexOf('\n', node.getStart()) + 1;
  return content.slice(lineStart, node.getStart());
}

function getLineStart(content, node) {
  return content.lastIndexOf('\n', node.getStart()) + 1;
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
    const replacement = `${indent}poll: '${url}',`;
    return {
      content: replaceRange(
        content,
        pollProperty.getStart(),
        pollProperty.getEnd(),
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
    const replacement = `${indent}winner: '${winner}',`;
    return {
      content: replaceRange(
        content,
        winnerProperty.getStart(),
        winnerProperty.getEnd(),
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
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    const optionsProperty = getOptionsProperty(node);
    if (!optionsProperty) {
      ts.forEachChild(node, visit);
      return;
    }

    const elements = optionsProperty.initializer.elements;
    if (elements.length !== 2) {
      ts.forEachChild(node, visit);
      return;
    }

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
      ts.forEachChild(node, visit);
      return;
    }

    if (elements.every(ts.isObjectLiteralExpression)) {
      const childWinners = elements.map(getWinner);
      matchups.push({
        node,
        type: 'internal',
        poll,
        winner,
        childWinners,
      });
    }

    ts.forEachChild(node, visit);
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
      (normalized[0] === expected[0] && normalized[1] === expected[1]) ||
      (normalized[0] === expected[1] && normalized[1] === expected[0]);

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
    if (
      normalizedCandidate === normalizedWinner ||
      normalizedCandidate.includes(normalizedWinner) ||
      normalizedWinner.includes(normalizedCandidate)
    ) {
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
