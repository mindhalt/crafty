/* global describe, it, expect */

const fs = require("fs");
const path = require("path");

const configuration = require("@swissquote/crafty/src/configuration");

const { run, cleanDist, exists } = require("../utils");

const getCrafty = configuration.getCrafty;

jest.setTimeout(10000);

it("Loads crafty-preset-maven, crafty-preset-babel and overrides configuration", () => {
  process.chdir(path.join(__dirname, "../fixtures/crafty-preset-maven/webapp"));
  const config = { mavenType: "webapp" };
  const crafty = getCrafty(
    ["@swissquote/crafty-preset-maven", "@swissquote/crafty-preset-babel"],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-maven");
  expect(loadedPresets).toContain("@swissquote/crafty-preset-babel");

  expect(crafty.config.destination.replace(`${process.cwd()}/`, "")).toEqual(
    "target/my-app-1.0.0-SNAPSHOT/resources"
  );

  expect(crafty.config.destination_js.replace(`${process.cwd()}/`, "")).toEqual(
    "target/my-app-1.0.0-SNAPSHOT/resources/js"
  );
});

it("Fails if no pom is found", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-maven/missing-pom"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(exists(dir, "dist/js/myBundle.min.js")).toBeTruthy();
});

it("Places files in target of a webapp", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-maven/webapp");
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(
    exists(dir, "target/my-app-1.0.0-SNAPSHOT/resources/js/myBundle.min.js")
  ).toBeTruthy();
});

it("Reads env. var before pom.xml", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-maven/env-override"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"], {
    env: { TARGET_BASEDIR: path.join(dir, "target/some_basedir") }
  });

  expect(result).toMatchSnapshot();

  expect(
    exists(dir, "target/some_basedir/resources/js/myBundle.min.js")
  ).toBeTruthy();
});

it("Places files in target of a webapp from within a subfolder", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-maven/subfolder/src/main/frontend"
  );
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(
    exists(dir,
      "../../../target/my-app-1.0.0-SNAPSHOT/resources/js/myBundle.min.js"
    )
  ).toBeTruthy();
});

it("Places files in target of a webjar", async () => {
  const dir = path.join(__dirname, "../fixtures/crafty-preset-maven/webjar");
  await cleanDist(dir);

  const result = await run(dir, ["run", "default"]);

  expect(result).toMatchSnapshot();

  expect(
   exists(dir,
      "target/classes/META-INF/resources/webjars/js/myBundle.min.js"
    )
  ).toBeTruthy();
});
