import {Octokit} from "@octokit/rest";
import {execSync} from "child_process";
import {createReadStream, unlinkSync, statSync} from "fs";

function log(level, msg) {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`[${ts}] ${msg}`);
}

function ghGroup(title) { console.log(`::group::${title}`); }
function ghEndGroup()    { console.log("::endgroup::"); }
function ghNotice(msg)   { console.log(`::notice::${msg}`); }
function ghWarning(msg)  { console.log(`::warning::${msg}`); }
function ghError(msg)    { console.log(`::error::${msg}`); }

function fmtSize(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + " GB";
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + " KB";
    return bytes + " B";
}

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const DRY_RUN = process.env.DRY_RUN === "true";

const IMAGE = "titanrgb/timetender";
const PLATFORMS = [
    {docker: "linux/amd64", label: "amd64"},
    {docker: "linux/arm64", label: "arm64"},
];

const stats = {
    total: 0,
    skipped: 0,
    pulled: 0,
    pullFailed: 0,
    uploaded: 0,
    uploadFailed: 0,
};

async function run() {
    log("notice", "Fetching releases...");
    const releases = await octokit.paginate(
        octokit.repos.listReleases,
        {owner, repo, per_page: 100}
    );

    log("notice", `Found ${releases.length} releases`);
    if (DRY_RUN) log("warning", "DRY-RUN mode — no uploads will happen");

    for (const r of releases) {
        const tag = r.tag_name;
        if (tag === "latest") continue;

        ghGroup(`Release: ${tag}`);

        for (const {docker: platform, label} of PLATFORMS) {
            const filename = `timetender-${tag}-docker-${label}.tar.gz`;
            const fullRef = `${IMAGE}:${tag}`;

            stats.total++;

            const existing = r.assets?.find(a => a.name === filename);
            if (existing) {
                log("notice", `  [${label}] SKIP — asset already exists`);
                stats.skipped++;
                continue;
            }

            log("notice", `  [${label}] PULL  ${fullRef} (${platform}) ...`);
            let pulled = false;
            try {
                execSync(`docker pull "${fullRef}" --platform ${platform}`, {
                    stdio: "pipe",
                    timeout: 300_000,
                });
                pulled = true;
                stats.pulled++;
            } catch (e) {
                const stderr = e.stderr?.toString() || "";
                log("warning", `  [${label}] PULL FAILED — no ${label} image for ${tag}`);
                if (stderr) {
                    const lines = stderr.trim().split("\n");
                    const last = lines[lines.length - 1];
                    if (last) log("warning", `         ${last}`);
                }
                stats.pullFailed++;
                continue;
            }

            log("notice", `  [${label}] SAVE  ${filename} ...`);
            try {
                execSync(`docker save "${fullRef}" | gzip > "${filename}"`, {
                    stdio: "pipe",
                    timeout: 120_000,
                });
            } catch (e) {
                ghError(`  [${label}] SAVE FAILED for ${tag}`);
                execSync(`docker rmi "${fullRef}"`, {stdio: "ignore"});
                stats.pullFailed++;
                continue;
            }

            execSync(`docker rmi "${fullRef}"`, {stdio: "ignore"});

            const fileSize = statSync(filename).size;
            log("notice", `  [${label}] SIZE  ${fmtSize(fileSize)}`);

            if (DRY_RUN) {
                log("notice", `  [${label}] DRY-RUN — would upload`);
                unlinkSync(filename);
                stats.uploaded++;
                continue;
            }

            log("notice", `  [${label}] UPLOAD ${filename} ...`);
            try {
                await octokit.repos.uploadReleaseAsset({
                    owner,
                    repo,
                    release_id: r.id,
                    name: filename,
                    data: createReadStream(filename),
                    headers: {
                        "content-length": fileSize,
                        "content-type": "application/gzip",
                    },
                });
                stats.uploaded++;
                log("notice", `  [${label}] DONE`);
            } catch (e) {
                ghError(`  [${label}] UPLOAD FAILED: ${e.status || ""} ${e.message || e}`);
                stats.uploadFailed++;
            }

            try { unlinkSync(filename); } catch (_) {}
        }

        ghEndGroup();
    }

    // ── Summary ──
    ghGroup("Summary");
    console.log(`  Total assets to process : ${stats.total}`);
    console.log(`  Already present (skip)  : ${stats.skipped}`);
    console.log(`  Pulled successfully     : ${stats.pulled}`);
    console.log(`  Pull failed             : ${stats.pullFailed}`);
    console.log(`  Uploaded                : ${stats.uploaded}`);
    console.log(`  Upload failed           : ${stats.uploadFailed}`);

    if (stats.uploadFailed > 0) {
        ghError(`${stats.uploadFailed} upload(s) failed — see details above`);
    }
    if (stats.pullFailed > 0) {
        ghWarning(`${stats.pullFailed} pull(s) failed — likely no multi-arch build for those tags`);
    }
    ghEndGroup();

    if (stats.uploadFailed > 0) {
        process.exit(1);
    }
}

run().catch(err => {
    ghError(`Fatal: ${err.message || err}`);
    process.exit(1);
});
