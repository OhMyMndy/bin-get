import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { which } from "https://deno.land/x/which@0.2.1/mod.ts";

const pathToCurl = await which("curl");
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
  const packageLocation = await which(packageName);
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
      "--yes",
      "--verbose",
      ...runArgs,
    ];
    const p = Deno.run({
      cmd: command,
      stderr: "piped",
      stdout: "piped",
    });
    const [code, rawError, output] = await Promise.all([
      p.status(),
      p.stderrOutput(),
      p.output(),
    ]);
    p.close();

    const errorString = new TextDecoder().decode(rawError);
    const outputString = new TextDecoder().decode(output);
    assertEquals(true, code.success, errorString + " =>" + outputString);

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

async function packageIsInstalled(packageNameShort: string): Promise<boolean> {
  const packageLocation: string | undefined = await which(packageNameShort);

  return packageLocation != undefined;
}
