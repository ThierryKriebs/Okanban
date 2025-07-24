import { describe, it } from "node:test";
import assert from "node:assert";
import { computeStrength } from "./game.js";

describe('computeStrength(level)', () => {
  it('Niveau 1', () => {
    const result = computeStrength(1);
    assert.equal(result, 1);
  });
  it('Niveau 50', () => {
    const result = computeStrength(50);
    assert.equal(result, 50);
  });
  it('Niveau 51', () => {
    const result = computeStrength(51);
    assert.equal(result, 50);
  });
  it('Niveau 52', () => {
    const result = computeStrength(52);
    assert.equal(result, 51);
  });
  it('Niveau 100', () => {
    const result = computeStrength(100);
    assert.equal(result, 75);
  });
  it('Niveau 101', () => {
    const result = computeStrength(101);
    assert.equal(result, 75);
  });
  it('Niveau 200', () => {
    const result = computeStrength(200);
    assert.equal(result, 108);
  });
  it('Niveau 205', () => {
    const result = computeStrength(205);
    assert.equal(result, 109);
  });
  it('Niveau 500', () => {
    const result = computeStrength(500);
    assert.equal(result, 168);
  });
});