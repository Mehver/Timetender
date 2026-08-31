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
const SOURCE_ENVIRONMENTS = ["docker-hub", "publish/docker-hub"];

function isDockerHubPublication(deployment) {
    return deployment.description === "Published Docker Hub image" &&
        deployment.payload &&
        typeof deployment.payload === "object" &&
        typeof deployment.payload.image === "string" &&
        deployment.payload.image.startsWith("docker.io/titanrgb/timetender:") &&
        typeof deployment.payload.digest === "string";
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

    const seenDeploymentIds = new Set();
    let inspected = 0;
    let changed = 0;
    let skipped = 0;

    for (const environment of SOURCE_ENVIRONMENTS) {
        const deployments = await octokit.paginate(
            octokit.rest.repos.listDeployments,
            {owner, repo, environment, per_page: 100}
        );

        for (const deployment of deployments) {
            if (seenDeploymentIds.has(deployment.id)) {
                continue;
            }
            seenDeploymentIds.add(deployment.id);
            inspected += 1;

            if (!isDockerHubPublication(deployment)) {
                skipped += 1;
                log(`Skipping deployment ${deployment.id}: it does not match the expected Docker Hub publication record`);
                continue;
            }

            const status = await latestStatus(deployment.id);
            if (!status) {
                skipped += 1;
                log(`Skipping deployment ${deployment.id}: it has no status to preserve`);
                continue;
            }
            if (status.environment !== "docker-hub") {
                skipped += 1;
                log(`Skipping deployment ${deployment.id}: its current environment is ${status.environment || "unset"}`);
                continue;
            }

            log(`${DRY_RUN ? "Would update" : "Updating"} deployment ${deployment.id}: docker-hub -> dockerhub`);
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
                environment: "dockerhub",
                environment_url: status.environment_url || undefined,
                log_url: status.log_url || status.target_url || undefined,
                auto_inactive: false,
            });
            changed += 1;
        }
    }

    const action = DRY_RUN ? "would update" : "updated";
    ghNotice(`${action} ${changed} Docker Hub deployment record(s); skipped ${skipped} of ${inspected} inspected record(s)`);
}

run().catch(err => {
    ghError(`Fatal: ${err.message || err}`);
    process.exit(1);
});
