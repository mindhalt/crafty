/* global describe, it, expect */

const fs = require("fs");
const path = require("path");

const { run, cleanDist, readFile, snapshotizeOutput } = require("../utils");

let testIfNotPnp = it;

try {
  require("pnpapi");
  testIfNotPnp = it.skip;
} catch (error) {
  // not in PnP; not a problem
}

jest.setTimeout(10000);

it("Succeeds without transpiling", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/succeeds");
  await cleanDist(dir);

  const result = await run(dir, ["test"]);

  expect(result).toMatchSnapshot();
});

it("Creates IDE Integration files", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/ide");
  await cleanDist(dir, ["jest.config.js", ".gitignore"]);

  const result = await run(dir, ["ide"]);

  expect(result).toMatchSnapshot();
  expect(snapshotizeOutput(readFile(dir, "jest.config.js"))).toMatchSnapshot();

  expect(snapshotizeOutput(readFile(dir, ".gitignore"))).toMatchSnapshot();
});

it("Creates IDE Integration files with Babel", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/ide-babel");
  await cleanDist(dir, ["jest.config.js", ".gitignore"]);

  const result = await run(dir, ["ide"]);

  expect(result).toMatchSnapshot();
  expect(snapshotizeOutput(readFile(dir, "jest.config.js"))).toMatchSnapshot();
});

testIfNotPnp("Succeeds with typescript", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/typescript");
  await cleanDist(dir);

  const result = await run(dir, ["test"]);

  expect(result).toMatchSnapshot();
});

it("Succeeds with babel", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/babel");
  await cleanDist(dir);

  const result = await run(dir, ["test"]);

  expect(result).toMatchSnapshot();
});

testIfNotPnp("Succeeds with babel and React", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-jest/babel-react"
  );
  await cleanDist(dir);

  const result = await run(dir, ["test"]);

  expect(result).toMatchSnapshot();
});

it("Succeeds with esm module", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/esm");
  await cleanDist(dir);

  const result = await run(dir, ["test"]);

  expect(result).toMatchSnapshot();
});

it("Succeeds with esm module and babel", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-jest/esm-babel");
  await cleanDist(dir);

  const result = await run(dir, ["test"]);

  expect(result).toMatchSnapshot();
});
