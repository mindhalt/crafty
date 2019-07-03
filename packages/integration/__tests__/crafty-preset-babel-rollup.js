/* global describe, it, expect */
const path = require("path");

const { run, cleanDist, exists, readFile } = require("../utils");

jest.setTimeout(10000);

it("Compiles JavaScript with rollup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-rollup/compiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-rollup/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints JavaScript with rollup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-rollup/lints"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
