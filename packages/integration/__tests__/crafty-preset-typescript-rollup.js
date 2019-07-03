/* global describe, it, expect, jest */

const path = require("path");

const { run, cleanDist, exists, readFile } = require("../utils");

// node-forge 0.6.33 doesn't work with jest.
// but selfsigned is fixed on this version
// as we don't use it for now, we can simply mock it
// https://github.com/jfromaniello/selfsigned/issues/16
jest.mock("node-forge");

jest.setTimeout(10000);

it("Works with rollup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-rollup/compiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myTSBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myTSBundle.min.js.map")).toBeTruthy();
  expect(readFile(dir, "dist/js/myTSBundle.min.js")).toMatchSnapshot();
});

it("Deletes rollup uglify plugin using crafty.config.js", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-rollup/compiles-no-uglify"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myTSBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myTSBundle.min.js.map")).toBeTruthy();
  expect(readFile(dir, "dist/js/myTSBundle.min.js")).toMatchSnapshot();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-rollup/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints TypeScript with rollup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-rollup/lints"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
