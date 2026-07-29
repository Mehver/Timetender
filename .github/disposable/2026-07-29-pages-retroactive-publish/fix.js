import {Octokit} from "@octokit/rest";
import {createWriteStream, mkdirSync, existsSync} from "fs";
import path from "path";

function log(level, msg) {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`[${ts}] ${msg}`);
}

function ghNotice(msg)  { console.log(`::notice::${msg}`); }
function ghWarning(msg) { console.log(`::warning::${msg}`); }
function ghError(msg)   { console.log(`::error::${msg}`); }

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const DRY_RUN = process.env.DRY_RUN === "true";

async function run() {
    log("notice", "Fetching latest release...");
    const {data: release} = await octokit.repos.getLatestRelease({
        owner,
        repo,
    });

    if (!release) {
        ghError("No release found");
        process.exit(1);
    }

    log("notice", `Latest release: ${release.tag_name} (${release.assets.length} assets)`);

    const htmlAsset = release.assets.find(a => a.name.endsWith(".html"));

    if (!htmlAsset) {
        ghError(`No HTML asset found in release ${release.tag_name}`);
        log("error", "Available assets:");
        for (const a of release.assets) {
            console.log(`  - ${a.name}`);
        }
        process.exit(1);
    }

    log("notice", `Found HTML asset: ${htmlAsset.name} (${htmlAsset.size} bytes)`);

    if (DRY_RUN) {
        log("warning", "DRY-RUN mode — would download and publish to Pages");
        return;
    }

    log("notice", `Downloading from ${htmlAsset.browser_download_url} ...`);

    const response = await octokit.request({
        url: htmlAsset.url,
        headers: {accept: "application/octet-stream"},
        request: {redirect: "follow"},
    });

    const publicDir = "public";
    if (!existsSync(publicDir)) {
        mkdirSync(publicDir);
    }

    const destPath = path.join(publicDir, "index.html");
    log("notice", `Writing ${destPath} ...`);
    createWriteStream(destPath).write(Buffer.from(response.data));
    log("notice", "Done preparing Pages artifact");
}

run().catch(err => {
    ghError(`Fatal: ${err.message || err}`);
    process.exit(1);
});
