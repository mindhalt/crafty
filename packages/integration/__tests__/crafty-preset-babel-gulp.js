/* global describe, it, expect */

const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");
const getCommands = require("@swissquote/crafty/src/commands/index");

const { run, cleanDist, exists, readFile } = require("../utils");

jest.setTimeout(10000);

const getCrafty = configuration.getCrafty;
it("Loads crafty-preset-babel and does not register gulp tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-babel"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );

  expect(loadedPresets).toContain("@swissquote/crafty-preset-babel");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Loads crafty-preset-babel, crafty-runner-gulp and registers gulp task", () => {
  const config = { js: { myBundle: { source: "css/style.scss" } } };
  const crafty = getCrafty(
    ["@swissquote/crafty-preset-babel", "@swissquote/crafty-runner-gulp"],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-babel");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "js_myBundle",
    "js",
    "default"
  ]);
});

it("Compiles JavaScript", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-gulp/compiles"
  );

  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();

  expect(exists(dir, "dist/js/script.js")).toBeTruthy();
  expect(exists(dir, "dist/js/script.js.map")).toBeTruthy();

  expect(exists(dir, "dist/js/otherfile.js")).toBeTruthy();
  expect(exists(dir, "dist/js/otherfile.js.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/script.js")).toMatchSnapshot();
  expect(readFile(dir, "dist/js/otherfile.js")).toMatchSnapshot();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-gulp/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Compiles JavaScript with custom babel plugin", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-gulp/compiles-babel-plugin"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();

  expect(exists(dir, "dist/js/script.js")).toBeTruthy();
  expect(exists(dir, "dist/js/script.js.map")).toBeTruthy();

  expect(readFile(dir, "dist/js/script.js")).toMatchSnapshot();
});

it("Compiles JavaScript and concatenates", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-gulp/concatenates"
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

it("Lints JavaScript", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-gulp/lints-es5"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints JavaScript, doesn't fail in development", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel-gulp/lints-es5-dev"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
