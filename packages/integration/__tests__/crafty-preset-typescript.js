/* global describe, it, expect */

const path = require("path");

const { run, cleanDist, exists } = require("../utils");

jest.setTimeout(10000);

it("Lints TypeScript using the command", async () => {
  const dir = path.join(
    __dirname,
    "../fixtures/crafty-preset-typescript/lints"
  );
  await cleanDist(dir);

  const result = await run(dir, ["jsLint", "js/**/*.ts"]);

  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(exists(dir, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(exists(dir, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
