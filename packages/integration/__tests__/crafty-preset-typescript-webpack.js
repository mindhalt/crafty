/* global describe, it, expect, jest */

const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");

const { run, cleanDist, exists, readFile } = require("../utils");

const getCrafty = configuration.getCrafty;

// node-forge 0.6.33 doesn't work with jest.
// but selfsigned is fixed on this version
// as we don't use it for now, we can simply mock it
// https://github.com/jfromaniello/selfsigned/issues/16
jest.mock("node-forge");

jest.setTimeout(10000);

it("Loads crafty-preset-typescript and does not register webpack tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-typescript"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-typescript");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Loads crafty-preset-typescript, crafty-runner-webpack and registers webpack task", () => {
  const config = { js: { myBundle: { source: "css/style.scss" } } };
  const crafty = getCrafty(
    [
      "@swissquote/crafty-preset-typescript",
      "@swissquote/crafty-runner-webpack"
    ],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-typescript");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-webpack");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "js_myBundle",
    "js",
    "default"
  ]);
});

it("Compiles TypeScript", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/compiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();
  expect(exists(dir, "dist/js/1.myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/1.myBundle.min.js.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/1.myBundle.min.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/js/SomeLibrary.d.ts")).toMatchSnapshot();
});

it("Compiles TypeScript - fork checker", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/compiles-forked"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();
  expect(exists(dir, "dist/js/1.myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/1.myBundle.min.js.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/1.myBundle.min.js")).toMatchSnapshot();
});

it("Lints TypeScript with webpack", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/lints"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myTSBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myTSBundle.min.js.map")).toBeFalsy();
});

it("Fails gracefully on invalid TS", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/invalid"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed types
  expect(exists(dir, "dist/js/myTSBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myTSBundle.min.js.map")).toBeFalsy();
});

it("Fails gracefully on invalid TS - fork checker", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/invalid-forked"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed types
  // TODO :: see if it can be done with fork TS Checker
  //expect(exists(dir, "dist/js/myTSBundle.min.js")).toBeFalsy();
  //expect(exists(dir, "dist/js/myTSBundle.min.js.map")).toBeFalsy();
});

it("Removes unused classes", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-webpack/tree-shaking"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();

  const content = readFile(dir, "dist/js/myBundle.min.js");

  expect(content.indexOf("From class A") > -1).toBeTruthy();
  expect(content.indexOf("From class B") > -1).toBeFalsy();
});
