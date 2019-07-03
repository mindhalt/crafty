/* global describe, it, expect, jest */

const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");
const getCommands = require("@swissquote/crafty/src/commands/index");

const {
  run,
  cleanDist,
  exists,
  readFile,
  snapshotizeOutput
} = require("../utils");

const getCrafty = configuration.getCrafty;

// node-forge 0.6.33 doesn't work with jest.
// but selfsigned is fixed on this version
// as we don't use it for now, we can simply mock it
// https://github.com/jfromaniello/selfsigned/issues/16
jest.mock("node-forge");

const PRESET_BABEL = "@swissquote/crafty-preset-babel";

jest.setTimeout(10000);

it("Loads crafty-preset-babel and does not register webpack tasks", () => {
  const crafty = getCrafty([PRESET_BABEL], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain(PRESET_BABEL);

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Loads crafty-preset-babel, crafty-runner-webpack and registers webpack task", () => {
  const config = { js: { myBundle: { source: "css/style.scss" } } };
  const crafty = getCrafty(
    [PRESET_BABEL, "@swissquote/crafty-runner-webpack"],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain(PRESET_BABEL);
  expect(loadedPresets).toContain("@swissquote/crafty-runner-webpack");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "js_myBundle",
    "js",
    "default"
  ]);
});

it("Fails on double runner with incorrect bundle assignment", () => {
  const config = { js: { myBundle: { source: "css/style.scss" } } };
  const crafty = getCrafty(
    [
      PRESET_BABEL,
      "@swissquote/crafty-runner-gulp",
      "@swissquote/crafty-runner-webpack"
    ],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain(PRESET_BABEL);
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-webpack");

  expect(() => crafty.createTasks()).toThrow(
    "You have multiple runners, please specify a runner for 'myBundle'. Available runners are ['gulp/babel', 'webpack']."
  );
});

it("Fails on double runner with imprecise bundle assignment", () => {
  const config = {
    js: { myBundle: { runner: "gulp", source: "css/style.scss" } }
  };
  const crafty = getCrafty(
    [
      PRESET_BABEL,
      "@swissquote/crafty-preset-typescript",
      "@swissquote/crafty-runner-gulp"
    ],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain(PRESET_BABEL);
  expect(loadedPresets).toContain("@swissquote/crafty-preset-typescript");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  expect(() => crafty.createTasks()).toThrow(
    "More than one valid runner exists for 'myBundle'. Has to be one of ['gulp/babel', 'gulp/typescript']."
  );
});

it("Fails on non-existing runners", () => {
  const config = {
    js: { myBundle: { runner: "someRunner", source: "css/style.scss" } }
  };
  const crafty = getCrafty(
    [
      PRESET_BABEL,
      "@swissquote/crafty-preset-typescript",
      "@swissquote/crafty-runner-gulp"
    ],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain(PRESET_BABEL);
  expect(loadedPresets).toContain("@swissquote/crafty-preset-typescript");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  expect(() => crafty.createTasks()).toThrow(
    "Invalid runner 'someRunner' for 'myBundle'. Has to be one of ['gulp/babel', 'gulp/typescript']."
  );
});

it("Assigns bundle only once when runner is specified", () => {
  const config = {
    js: { myBundle: { runner: "webpack", source: "css/style.scss" } }
  };
  const crafty = getCrafty(
    [
      PRESET_BABEL,
      "@swissquote/crafty-runner-gulp",
      "@swissquote/crafty-runner-webpack"
    ],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain(PRESET_BABEL);
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-webpack");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "js_myBundle",
    "js",
    "default"
  ]);
});

it("Lints JavaScript using command", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-babel/lints");
  await cleanDist(dir);

  const result = await run(dir, ["jsLint", "js/**/*.js"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Generates IDE Helper", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-babel/ide");
  await cleanDist(dir, [".eslintrc.js", "prettier.config.js", ".gitignore"]);

  const result = await run(dir, ["ide"]);

  expect(result).toMatchSnapshot();

  expect(snapshotizeOutput(readFile(dir, ".eslintrc.js"))).toMatchSnapshot();

  expect(
    snapshotizeOutput(readFile(dir, "prettier.config.js"))
  ).toMatchSnapshot();

  expect(snapshotizeOutput(readFile(dir, ".gitignore"))).toMatchSnapshot();
});

it("Lints JavaScript using command, ignore crafty.config.js", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-babel/lints-ignore-config"
  );
  await cleanDist(dir);

  const result = await run(dir, [
    "--preset",
    PRESET_BABEL,
    "--ignore-crafty-config",
    "jsLint",
    "crafty.config.js"
  ]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints JavaScript using command, legacy", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-babel/lints-es5");
  await cleanDist(dir);

  const result = await run(dir, ["jsLint", "js/**/*.js", "--preset", "legacy"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints JavaScript using command, recommended preset", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-babel/lints");
  await cleanDist(dir);

  const result = await run(dir, [
    "jsLint",
    "js/**/*.js",
    "--preset",
    "recommended"
  ]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints JavaScript using command, explicit configuration", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-babel/lints");
  await cleanDist(dir);

  const result = await run(dir, [
    "jsLint",
    "js/**/*.js",
    "--config",
    "eslintOverride.json"
  ]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
