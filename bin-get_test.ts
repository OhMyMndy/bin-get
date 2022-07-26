import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";

const defaultAllows = new Map<string, string | null>([
  ["--allow-write", "/usr/local/bin/,/tmp"],
  ["--allow-env", null],
  ["--allow-read", null],
  ["--allow-net", "api.github.com"],
]);

function getAllowList(options: Map<string, string>): string[] {
  const allowsList = defaultAllows;

  return Array.from(
    Array.from(allowsList)
      .map(([k, v]) => {
        if (options.has(k)) {
          if (v) {
            v += options.get(k);
          } else {
            v = options.get(k) + "";
          }
        }
        if (v) {
          return `${k}=${v}`;
        }
        return k;
      })
      .values(),
  );
}

async function removeBinary(packageName: string) {
  const p = Deno.run({
    cmd: ["which", packageName],
    stdout: "piped",
  });
  const [stdout] = await Promise.all([p.output()]);
  p.close();

  const packageLocation = new TextDecoder().decode(stdout).trim();
  if (packageLocation) {
    await Deno.remove(packageLocation);
  }
}

async function testBinGet(
  packageName: string,
  runArgs: string[] = [],
  packageInstallLocation: string | null = null,
) {
  const packageNameShort = packageName.split("/")[1];

  await removeBinary(packageNameShort);
  Deno.test(`Test install ${packageName}`, async () => {
    if (packageInstallLocation != null) {
      runArgs.push("--directory", packageInstallLocation);
    }

    const command = [
      "deno",
      "run",
      "--allow-all",
      "./bin-get.ts",
      "install",
      packageName,
      "--force",
      "--verbose",
      ...runArgs,
    ];
    const p = Deno.run({
      cmd: command,
      stderr: "piped",
    });
    const [code, rawError] = await Promise.all([p.status(), p.stderrOutput()]);
    p.close();

    const errorString = new TextDecoder().decode(rawError);
    assertEquals(true, code.success, errorString);

    await packageIsInstalled(packageNameShort);
    await removeBinary(packageNameShort);
  });
}

const testPackages: string[] = [
  // "helm/helm",
  "sachaos/viddy",
  "r-darwish/topgrade",
  "hadolint/hadolint",
  "whalebrew/whalebrew",
];

for (const testPackage of testPackages) {
  await testBinGet(testPackage);
}

// @todo helm is installed on the Windows runner so we cannot remove it that easily (I think)
// Deno.test(`Test install sachaos/viddy with predefined allow list`, async () => {
//   await testBinGet(
//     "sachaos/viddy",
//     getAllowList(new Map<string, string>([["--allow-net", ",get.helm.sh"]])),
//   );
// });

Deno.test("Test install sachaos/viddy with custom location", async () => {
  await testBinGet("sachaos/viddy", ["--directory", "/root/.bin"]);
});

async function packageIsInstalled(packageNameShort: string) {
  const p = Deno.run({
    cmd: ["which", packageNameShort],
    stdout: "piped",
    stderr: "piped",
  });
  const [code, stdout, stderr] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);
  p.close();
  const stdoutString = new TextDecoder().decode(stdout);
  const ststderrdoutString = new TextDecoder().decode(stderr);
  const codeString = JSON.stringify(code);
  assertEquals(
    true,
    code.success,
    `${packageNameShort} should be installed ${stdoutString} ${ststderrdoutString} ${codeString}`,
  );
}
