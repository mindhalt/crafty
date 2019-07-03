/* global describe, it, expect */

const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");

const { run, cleanDist, exists, readFile } = require("../utils");

const getCrafty = configuration.getCrafty;

jest.setTimeout(10000);

it("Loads crafty-preset-typescript and does not register gulp tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-typescript"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-typescript");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Loads crafty-preset-typescript, crafty-runner-gulp and registers gulp task", () => {
  const config = { js: { myBundle: { source: "js/**/*.ts" } } };
  const crafty = getCrafty(
    ["@swissquote/crafty-preset-typescript", "@swissquote/crafty-runner-gulp"],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-typescript");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

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
    "../fixtures/crafty-preset-typescript-gulp/compiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();

  expect(exists(dir, "dist/js/script.js")).toBeTruthy();
  expect(exists(dir, "dist/js/script.js.map")).toBeTruthy();

  expect(exists(dir, "dist/js/Component.js")).toBeTruthy();
  expect(exists(dir, "dist/js/Component.js.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/script.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/Component.js")).toMatchSnapshot();
});

it("Compiles TypeScript and concatenates", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-gulp/concatenates"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeTruthy();

  expect(exists(dir, "dist/js/script.js")).toBeFalsy();
  expect(exists(dir, "dist/js/script.js.map")).toBeFalsy();

  expect(exists(dir, "dist/js/otherfile.js")).toBeFalsy();
  expect(exists(dir, "dist/js/otherfile.js.map")).toBeFalsy();

  expect(readFile(dir, "dist/js/myBundle.min.js")).toMatchSnapshot();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-gulp/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints TypeScript", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript-gulp/lints"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
