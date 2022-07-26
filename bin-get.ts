#!/usr/bin/env -S deno run --allow-write=/usr/bin/,/tmp --allow-env --allow-read --allow-net=api.github.com

import { red } from "https://esm.sh/nanocolors@0.1.12";
import { tgz } from "https://deno.land/x/compress@v0.4.4/mod.ts";
import {
  copy,
  readerFromStreamReader,
} from "https://deno.land/std@0.149.0/streams/conversion.ts";
import { exists } from "https://deno.land/std@0.149.0/fs/mod.ts";

import yargs from "https://deno.land/x/yargs@v17.5.1-deno/deno.ts";
import { Arguments } from "https://deno.land/x/yargs@v17.5.1-deno/deno-types.ts";
import { YargsInstance } from "https://deno.land/x/yargs@v17.5.1-deno/build/lib/yargs-factory.js";

import { emptyDir, walkSync } from "https://deno.land/std@0.149.0/fs/mod.ts";
import osPaths from "https://deno.land/x/os_paths@v6.9.0/src/mod.deno.ts";

type ApiResult = {
  message: string | undefined;
  body: string | undefined;
  assets: Array<Asset> | undefined;
};
type Asset = {
  browser_download_url: string;
  name: string;
  type: "tgz" | "binary";
};

async function install(
  githubPackageName: string,
  version: string,
  installDirectory: string,
  force: boolean,
) {
  if (!githubPackageName) {
    console.log(red("Please provide a package name as the second argument"));
    Deno.exit(5);
  }

  let githubApiUrl =
    `https://api.github.com/repos/${githubPackageName}/releases/latest`;
  if (version) {
    githubApiUrl =
      `https://api.github.com/repos/${githubPackageName}/releases/tags/${version}`;
  }

  let result;
  try {
    result = await api(githubApiUrl) as ApiResult;
  } catch (error) {
    console.error(`Error for url ${githubApiUrl}`);
    console.error(red(error));
    return Deno.exit(5);
  }
  if (result.message) {
    console.log(
      red(
        `${result.message} for package ${githubPackageName} at ${githubApiUrl}`,
      ),
    );
    Deno.exit(1);
  }
  if (result.assets) {
    appendAssetsFromBody(result);
    result.assets = result.assets.filter(function (asset: Asset) {
      return matchAssetToPlatform(asset);
    });

    if (result.assets.length === 0) {
      console.log(red(`No downloadable asset found for ${githubPackageName}`));
      Deno.exit(3);
    }
    // if (result.assets.length > 1) {
    //   console.log(red(`Multiple downloadable assets found for ${githubPackageName}`));
    //   console.log(result.assets.map((asset) => asset.browser_download_url));
    // }
    downloadAsset(result.assets[0], githubPackageName, installDirectory, force);
  }
}
const systemArch = Deno.build.arch.toLowerCase();
const archMap: Record<string, string[]> = {
  x86_64: ["x86_64", "amd64"],
};

const os = Deno.build.os.toLowerCase();

function matchAssetToPlatform(asset: Asset): boolean {
  const assetName = asset.name.toLowerCase();
  let architectureMatch = false;
  if (archMap[systemArch]) {
    for (const arch of archMap[systemArch]) {
      if (assetName.match(arch)) {
        architectureMatch = true;
        break;
      }
    }
  }
  if (!architectureMatch) {
    return false;
  }

  if (!assetName.match(os)) {
    return false;
  }

  if (assetName.match(/(\.asc|\.sha[0-9]+(sum)?|\.md5)$/)) {
    return false;
  }

  if (assetName.match(/(tar\.gz|tgz)$/)) {
    asset.type = "tgz";
  } else if (assetName.match(/\.exe$/)) {
    asset.type = "binary";
  } else {
    asset.type = "binary";
  }

  return true;
}

function appendAssetsFromBody(result: ApiResult) {
  const urls = result.body?.matchAll(/http[^)]+/g);
  if (!urls) {
    return;
  }

  for (const url of urls) {
    result.assets?.push({
      browser_download_url: url[0],
      name: url[0],
    } as Asset);
  }
}
async function downloadAsset(
  asset: Asset,
  githubPackageName: string,
  installDirectory: string,
  force: boolean,
): Promise<boolean> {
  verbose && console.log(asset);

  const packageName = githubPackageName.split("/")[1];
  const tempDir = await Deno.makeTempDir();
  const tempResult = await Deno.makeTempFile();
  let filePath: string | null = null;

  const response = await fetch(asset.browser_download_url);
  const rdr = response.body?.getReader();
  if (rdr) {
    const r = readerFromStreamReader(rdr);
    const f = await Deno.open(tempResult, {
      create: true,
      write: true,
    });
    await copy(r, f);
    f.close();
  }

  if (asset.type == "tgz") {
    if (verbose) {
      console.log(`Uncompressing '${tempResult}' to ${tempDir}`);
    }
    await tgz.uncompress(tempResult, tempDir);
    // now copy the binary to the tempResult binary
    const files = Array.from(
      walkSync(tempDir, {
        includeDirs: false,
        includeFiles: true,
      }),
    );
    for (const file of files) {
      if (file.name == packageName) {
        filePath = file.path;
        break;
      }
    }
  } else if (asset.type == "binary") {
    filePath = tempResult;
  }
  try {
    if (filePath) {
      console.log(
        `Installing ${packageName} to ${filePath} and creating directory if not exists ${installDirectory}`,
      );
      if (os !== "windows") {
        await Deno.chmod(filePath, 0o755);
      }
      await Deno.mkdir(installDirectory, {
        recursive: true,
      });
      const installLocation: string = installDirectory + "/" + packageName;

      if (!yes) {
        const answerInstallation = prompt(
          `Do you want to install ${packageName} at ${installLocation}? [y/N]`,
        );
        if (answerInstallation?.toLowerCase().trim() == "n") {
          Deno.exit(0);
        }
      }

      if ((await exists(installLocation)) && !force) {
        const answer = prompt(
          `File already exists at ${installLocation}, do you want to override? [y/N]`,
        );
        if (answer?.toLowerCase().trim() == "n") {
          Deno.exit(0);
        }
      }
      if (await exists(installLocation)) {
        await Deno.remove(installLocation);
      }
      if (verbose) {
        console.log(`Now installing to '${installLocation}'`);
      }
      await Deno.copyFile(filePath, installLocation);
    }
  } finally {
    await emptyDir(tempDir);
    await Deno.remove(tempResult);
  }

  return true;
}

async function api(url: string): Promise<ApiResult> {
  const headers: Record<string, string> = {};
  if (url.match(/github/)) {
    const credentials = githubCredentials();
    if (credentials) {
      if (verbose) {
        console.log(`Using Github credentials ${credentials[0]}`);
      }

      headers["Authorization"] = "Basic " + credentials.join(":");
    } else {
      console.log("No Github credentials found");
    }
  }
  const result = await fetch(url, {
    headers: headers,
  });
  const body: string = await result.text();
  if (result.status !== 200) {
    
    console.error(`Non 200 status code (${result.status}) '${result.statusText}' when calling '${url}'`);
    if (!githubCredentials) {
      console.error("Try adding Github credentials to work around the API limit problem")
    }
    if (verbose) {
      console.error(body.length);
      console.error(body);
      console.error(result.headers)
    }
    Deno.exit(3);
  }

  try {
    return JSON.parse(body) as ApiResult;
  } catch (error) {
    console.error(`Error while deconding JSON response from '${url}'`);
    console.error(error);
    Deno.exit(3);
  }
}

function githubCredentials() {
  const token = Deno.env.get("GITHUB_TOKEN");
  const user = Deno.env.get("GITHUB_USER");
  if (token && user) {
    return [user, token];
  }
  if (token) {
    return [token];
  }
  return null;
}
let verbose = false;
var yes = false;
await yargs(Deno.args)
  .scriptName("bin-get")
  .command(
    "install <package> [package-version] [--yes] [--force] [--verbose] [--directory]",
    "install a package",
    (yargs: YargsInstance) => {
      yargs.positional("package-version", {
        describe: "Github repo name (helm/helm for example)",
      })
        .option("yes", {
          default: false,
          type: "boolean",
        })
        .option("verbose", {
          default: false,
          type: "boolean",
        })
        .option("force", {
          default: false,
          type: "boolean",
        });
    },
    (argv: Arguments) => {
      verbose = argv.verbose;
      yes = argv.yes;
      const os = Deno.build.os.toLowerCase();
      if (!argv.directory) {
        if (os === "windows") {
          const homeDir = osPaths.home();
          if (!homeDir) {
            console.error(
              red(
                "Cannot find home directory",
              ),
            );
            Deno.exit(6);
          }
          argv.directory = `${homeDir}/.bin`;
        } else {
          argv.directory = "/usr/local/bin";
        }
      }
      install(
        argv.package,
        argv["package-version"],
        argv.directory,
        argv.force,
      );
    },
  )
  .strictCommands()
  .demandCommand(1)
  .parse();
