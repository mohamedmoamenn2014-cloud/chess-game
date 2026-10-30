import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { evaluateBoard, analyzeMoveQuality } from './chessEngine';
import { identifyOpening } from './openings';
import { generateChess960FEN, checkKOTHWin, KOTH_CENTER_SQUARES } from './chessVariants';

test('Initial chess board has equal evaluation', () => {
  const chess = new Chess();
  const score = evaluateBoard(chess);
  assert.equal(score, 0, 'Initial score should be balanced');
});

test('Checkmate evaluates to decisive extreme value', () => {
  const chess = new Chess();
  // Scholar's Mate: 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#
  chess.move('e4');
  chess.move('e5');
  chess.move('Qh5');
  chess.move('Nc6');
  chess.move('Bc4');
  chess.move('Nf6');
  chess.move('Qxf7#');
  assert.equal(chess.isCheckmate(), true, 'Position should be checkmate');
  const score = evaluateBoard(chess);
  assert.equal(score, 99999, 'White won by checkmate, score should be +99999');
});

test('Openings database accurately identifies Sicilian Defense', () => {
  const moves = ['e4', 'c5'];
  const opening = identifyOpening(moves);
  assert.ok(opening, 'Should identify opening');
  assert.equal(opening?.eco, 'B20');
  assert.equal(opening?.nameAr, 'الدفاع الصقلي');
});

test('Openings database identifies Ruy Lopez', () => {
  const moves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'];
  const opening = identifyOpening(moves);
  assert.ok(opening, 'Should identify Ruy Lopez');
  assert.equal(opening?.eco, 'C60');
});

test('Chess960 generates valid legal starting FEN with 2 bishops of opposite colors', () => {
  const fen = generateChess960FEN();
  assert.ok(fen.includes('w - - 0 1'), 'FEN should be valid white turn');
  const chess = new Chess(fen);
  assert.equal(chess.isGameOver(), false);
  const moves = chess.moves();
  assert.ok(moves.length > 0, 'Chess960 position should have legal moves');
});

test('King of the Hill detects victory on center square', () => {
  const chess = new Chess('8/8/8/4K3/8/8/8/4k3 w - - 0 1');
  const winColor = checkKOTHWin(chess, 'e5');
  assert.equal(winColor, 'w', 'White king on e5 should win King of the Hill');
});

test('Move quality analysis identifies good moves vs blunders', () => {
  const blunder = analyzeMoveQuality(0.0, -3.5, true);
  assert.equal(blunder, 'blunder', 'Drop of 3.5 pawns should be classified as blunder');

  const good = analyzeMoveQuality(0.0, 0.1, true);
  assert.equal(good, 'best', 'Equal or better move should be best');
});
