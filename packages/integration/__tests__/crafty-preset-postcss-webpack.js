/* global describe, it, expect */

const path = require("path");

const { run, cleanDist, exists, readFile } = require("../utils");

jest.setTimeout(10000);

it("Compiles CSS within webpack", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-webpack/compiles"
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
    "../fixtures/crafty-preset-postcss-webpack/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Compiles CSS within webpack, extracts CSS ('extractCSS' boolean option)", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-webpack/extract-boolean"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle-default.min.css")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle-default.min.css.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/myBundle-default.min.css")).toMatchSnapshot();
});

it("Compiles CSS within webpack, extracts CSS ('extractCSS' string option)", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-webpack/extract-string"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle-string.min.css")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle-string.min.css.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/myBundle-string.min.css")).toMatchSnapshot();
});

it("Compiles CSS within webpack, extracts CSS ('extractCSS' object option)", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-webpack/extract-object"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle-object.min.css")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle-object.min.css.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/myBundle-object.min.css")).toMatchSnapshot();
});
