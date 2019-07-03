/* global describe, it, expect */

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

jest.setTimeout(10000);

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
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss/no-bundle"
  );
  await cleanDist(dir);

  const result = await run(dir, ["cssLint", "css/*.scss"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist")).toBeFalsy();
});

it("Lints with the command in legacy mode", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss/no-bundle"
  );
  await cleanDist(dir);

  const result = await run(dir, [
    "cssLint",
    "css/*.scss",
    "--preset",
    "legacy"
  ]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist")).toBeFalsy();
});

it("Lints with the command with custom config", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss/no-bundle"
  );
  await cleanDist(dir);

  const result = await run(dir, [
    "cssLint",
    "css/*.scss",
    "--config",
    "stylelint.json"
  ]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist")).toBeFalsy();
});

it("Creates IDE Integration files", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-postcss/ide");
  await cleanDist(dir, ["stylelint.config.js", "prettier.config.js", ".gitignore"]);

  const result = await run(dir, ["ide"]);

  expect(result).toMatchSnapshot();
  expect(
    snapshotizeOutput(readFile(dir, "stylelint.config.js"))
  ).toMatchSnapshot();

  expect(
    snapshotizeOutput(readFile(dir, "prettier.config.js"))
  ).toMatchSnapshot();

  expect(snapshotizeOutput(readFile(dir, ".gitignore"))).toMatchSnapshot();
});
