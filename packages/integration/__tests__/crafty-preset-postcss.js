/* global describe, it, expect */

const path = require("path");
const rmfr = require("rmfr");
const configuration = require("@swissquote/crafty/src/configuration");
const getCommands = require("@swissquote/crafty/src/commands/index");

const testUtils = require("../utils");

// Add a high timeout because of https://github.com/facebook/jest/issues/8942
// Tests would be unreliable if they timeout >_<
jest.setTimeout(30000);

const getCrafty = configuration.getCrafty;

it("Loads crafty-preset-postcss and does not register gulp tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-postcss"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-postcss");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("cssLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Lints with the command", async () => {
  const cwd = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss/no-bundle"
  );
  await rmfr(path.join(cwd, "dist"));

  const result = await testUtils.run(["cssLint", "css/*.scss"], cwd);

  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist")).toBeFalsy();
});

it("Lints with the command in legacy mode", async () => {
  const cwd = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss/no-bundle"
  );
  await rmfr(path.join(cwd, "dist"));

  const result = await testUtils.run(
    ["cssLint", "css/*.scss", "--preset", "legacy"],
    cwd
  );

  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist")).toBeFalsy();
});

it("Lints with the command with custom config", async () => {
  const cwd = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss/no-bundle"
  );
  await rmfr(path.join(cwd, "dist"));

  const result = await testUtils.run(
    ["cssLint", "css/*.scss", "--config", "stylelint.json"],
    cwd
  );

  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist")).toBeFalsy();
});

it("Creates IDE Integration files", async () => {
  const cwd = path.join(__dirname, "../fixtures/crafty-preset-postcss/ide");
  await rmfr(path.join(cwd, "stylelint.config.js"));
  await rmfr(path.join(cwd, "prettier.config.js"));
  await rmfr(path.join(cwd, ".gitignore"));

  const result = await testUtils.run(["ide"], cwd);

  expect(result).toMatchSnapshot();
  expect(
    testUtils.readForSnapshot(cwd, "stylelint.config.js")
  ).toMatchSnapshot();

  expect(
    testUtils.readForSnapshot(cwd, "prettier.config.js")
  ).toMatchSnapshot();

  expect(testUtils.readForSnapshot(cwd, ".gitignore")).toMatchSnapshot();
});
