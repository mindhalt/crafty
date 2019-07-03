/* global describe, it, expect */

const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");
const getCommands = require("@swissquote/crafty/src/commands/index");

const {
  run,
  cleanDist,
  exists,
  readFile,
  snapshotizeCSS
} = require("../utils");

const getCrafty = configuration.getCrafty;

jest.setTimeout(10000);

it("Loads crafty-preset-postcss, crafty-runner-gulp and registers gulp task", () => {
  const config = { myBundle: { source: "css/style.scss" } };
  const crafty = getCrafty(
    ["@swissquote/crafty-preset-postcss", "@swissquote/crafty-runner-gulp"],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-postcss");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("cssLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "css__lint",
    "default"
  ]);
});

it("Doesn't compile without a task, but lints", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-gulp/no-bundle"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist")).toBeFalsy();
});

it("Doesn't compile without a task, but lints (doesn't throw in development)", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-gulp/no-bundle-dev"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist")).toBeFalsy();
});

it("Fails gracefully on broken markup", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-gulp/fails"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist")).toBeFalsy();
});

it("Experiment with all CSS", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-gulp/experiment"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/css/myBundle.min.css")).toBeTruthy();
  expect(exists(dir, "dist/css/myBundle.min.css.map")).toBeTruthy();

  expect(
    snapshotizeCSS(readFile(dir, "dist/css/myBundle.min.css"))
  ).toMatchSnapshot();
});

it("Compiles CSS", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-gulp/compiles"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/css/myBundle.min.css")).toBeTruthy();
  expect(exists(dir, "dist/css/myBundle.min.css.map")).toBeTruthy();
  expect(exists(dir, "dist/css/imported.scss")).toBeFalsy();

  expect(readFile(dir, "dist/css/myBundle.min.css")).toEqual(
    ".Link{color:#00f}.BodyComponent{margin:0}\n/*# sourceMappingURL=myBundle.min.css.map */\n"
  );
});

it("Compiles CSS, configuration has overrides", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-postcss-gulp/compiles-with-overrides"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/css/myBundle.min.css")).toBeTruthy();
  expect(exists(dir, "dist/css/myBundle.min.css.map")).toBeTruthy();
  expect(exists(dir, "dist/css/imported.scss")).toBeFalsy();

  expect(readFile(dir, "dist/css/myBundle.min.css")).toEqual(
    ".Link{color:#fa5b35}.BodyComponent{margin:0}\n/*# sourceMappingURL=myBundle.min.css.map */\n"
  );
});
