import {Octokit} from "@octokit/rest";
import {execSync} from "child_process";
import {createReadStream, unlinkSync, statSync} from "fs";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_REPOSITORY.split("/")[0];
const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
const DRY_RUN = process.env.DRY_RUN === "true";

const IMAGE = "titanrgb/timetender";
const PLATFORMS = [
    {docker: "linux/amd64", label: "amd64"},
    {docker: "linux/arm64", label: "arm64"},
];

async function run() {
    const releases = await octokit.paginate(
        octokit.repos.listReleases,
        {owner, repo, per_page: 100}
    );

    for (const r of releases) {
        const tag = r.tag_name;

        if (tag === "latest") continue;

        console.log(`\n=== Processing release: ${tag} ===`);

        for (const {docker: platform, label} of PLATFORMS) {
            const filename = `timetender-${tag}-docker-${label}.tar.gz`;
            const fullRef = `${IMAGE}:${tag}`;

            const existing = r.assets?.find(a => a.name === filename);
            if (existing) {
                console.log(`  [${label}] Asset exists, skip.`);
                continue;
            }

            console.log(`  [${label}] Pulling ${fullRef} ...`);
            try {
                execSync(`docker pull "${fullRef}" --platform ${platform}`, {stdio: "inherit"});
            } catch (e) {
                console.log(`  [${label}] Pull failed — no ${label} build for this tag.`);
                continue;
            }

            console.log(`  [${label}] Saving ${filename} ...`);
            execSync(`docker save "${fullRef}" | gzip > "${filename}"`, {stdio: "inherit"});
            const fileSize = statSync(filename).size;

            if (DRY_RUN) {
                console.log(`  [${label}] DRY-RUN: would upload ${filename} (${(fileSize / 1e6).toFixed(1)} MB)`);
                unlinkSync(filename);
                continue;
            }

            console.log(`  [${label}] Uploading ${filename} (${(fileSize / 1e6).toFixed(1)} MB) ...`);
            await octokit.repos.uploadReleaseAsset({
                owner,
                repo,
                release_id: r.id,
                name: filename,
                data: createReadStream(filename),
            });

            console.log(`  [${label}] Done.`);
            unlinkSync(filename);
        }
    }

    console.log("\nAll done.");
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
