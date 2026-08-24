import {Octokit} from "@octokit/rest";

function log(msg) {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`[${timestamp}] ${msg}`);
}

function ghNotice(msg) { console.log(`::notice::${msg}`); }
function ghWarning(msg) { console.log(`::warning::${msg}`); }
function ghError(msg) { console.log(`::error::${msg}`); }

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const DRY_RUN = process.env.DRY_RUN === "true";
const MIGRATIONS = [
    {
        from: "publish/docker-hub",
        to: "docker-hub",
        description: "Published Docker Hub image",
        matchesPayload: payload =>
            typeof payload.image === "string" &&
            payload.image.startsWith("docker.io/titanrgb/timetender:") &&
            typeof payload.digest === "string",
    },
    {
        from: "publish/ghcr",
        to: "ghcr",
        description: "Published GHCR image",
        matchesPayload: payload =>
            typeof payload.image === "string" &&
            payload.image.startsWith("ghcr.io/mehver/timetender:") &&
            typeof payload.digest === "string",
    },
    {
        from: "publish/github-pages",
        to: "github-pages",
        description: "Published GitHub Pages",
        matchesPayload: payload =>
            typeof payload.url === "string" && payload.url.length > 0,
    },
];

function isExpectedDeployment(deployment, migration) {
    return deployment.description === migration.description &&
        deployment.payload &&
        typeof deployment.payload === "object" &&
        migration.matchesPayload(deployment.payload);
}

async function latestStatus(deploymentId) {
    const statuses = await octokit.paginate(
        octokit.rest.repos.listDeploymentStatuses,
        {owner, repo, deployment_id: deploymentId, per_page: 100}
    );
    return statuses.reduce(
        (latest, status) => !latest || status.id > latest.id ? status : latest,
        undefined
    );
}

async function run() {
    if (DRY_RUN) {
        ghWarning("DRY-RUN mode - deployment records will not be changed");
    }

    let inspected = 0;
    let changed = 0;
    let skipped = 0;

    for (const migration of MIGRATIONS) {
        const deployments = await octokit.paginate(
            octokit.rest.repos.listDeployments,
            {owner, repo, environment: migration.from, per_page: 100}
        );

        for (const deployment of deployments) {
            inspected += 1;
            if (!isExpectedDeployment(deployment, migration)) {
                skipped += 1;
                log(`Skipping deployment ${deployment.id}: it does not match the expected publication record`);
                continue;
            }

            const status = await latestStatus(deployment.id);
            if (!status) {
                skipped += 1;
                log(`Skipping deployment ${deployment.id}: it has no status to preserve`);
                continue;
            }
            if (status.environment === migration.to) {
                skipped += 1;
                log(`Skipping deployment ${deployment.id}: already uses ${migration.to}`);
                continue;
            }

            log(`${DRY_RUN ? "Would update" : "Updating"} deployment ${deployment.id}: ${migration.from} -> ${migration.to}`);
            if (DRY_RUN) {
                changed += 1;
                continue;
            }

            await octokit.rest.repos.createDeploymentStatus({
                owner,
                repo,
                deployment_id: deployment.id,
                state: status.state,
                description: status.description || "",
                environment: migration.to,
                environment_url: status.environment_url || undefined,
                log_url: status.log_url || status.target_url || undefined,
                auto_inactive: false,
            });
            changed += 1;
        }
    }

    const action = DRY_RUN ? "would update" : "updated";
    ghNotice(`${action} ${changed} deployment record(s); skipped ${skipped} of ${inspected} inspected record(s)`);
}

run().catch(err => {
    ghError(`Fatal: ${err.message || err}`);
    process.exit(1);
});
