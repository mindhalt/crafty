/* global describe, it, expect */
const path = require("path");

const { run, cleanDist, exists, readFile } = require("../utils");

jest.setTimeout(10000);

const BUNDLE = "dist/js/myBundle.min.js";
const BUNDLE_MAP = `${BUNDLE}.map`;

it("Compiles JavaScript", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/compiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();

  expect(readFile(dir, BUNDLE)).toMatchSnapshot();
});

it("Compiles Generators", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/compiles-generators"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();

  expect(readFile(dir, BUNDLE)).toMatchSnapshot();
});

it("Deduplicates helpers", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/compiles-deduplicates"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();

  expect(readFile(dir, BUNDLE)).toMatchSnapshot();
});

it("Does not transpile on modern browsers", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/no-old-browser"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();

  expect(readFile(dir, BUNDLE)).toMatchSnapshot();
});

it("Compiles JavaScript with externals", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/externals"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();

  expect(readFile(dir, BUNDLE)).toMatchSnapshot();
});

it("Creates profiles", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/profiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default", "--profile"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle_report.html")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle_stats.json")).toBeTruthy();

  expect(readFile(dir, BUNDLE)).toMatchSnapshot();
});

it("Lints JavaScript with webpack", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/lints"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, BUNDLE)).toBeFalsy();
  expect(exists(dir, BUNDLE_MAP)).toBeFalsy();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, BUNDLE)).toBeFalsy();
  expect(exists(dir, BUNDLE_MAP)).toBeFalsy();
});

it("Removes unused classes", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-webpack/tree-shaking"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, BUNDLE)).toBeTruthy();
  expect(exists(dir, BUNDLE_MAP)).toBeTruthy();

  const content = readFile(dir, BUNDLE);

  expect(content.indexOf("From class A") > -1).toBeTruthy();
  expect(content.indexOf("From class B") > -1).toBeFalsy();
});
