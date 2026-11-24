// Break-it test: this test fails on purpose so the ci check goes red. Never merge.
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('deliberately failing test for the break-it check', () => {
  assert.equal(1 + 1, 3);
});
