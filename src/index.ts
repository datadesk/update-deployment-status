// packages
import { error, getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

type DeploymentStatusStates =
  | 'error'
  | 'failure'
  | 'inactive'
  | 'in_progress'
  | 'queued'
  | 'pending'
  | 'success';

async function run() {
  try {
    // The commit SHA that triggered the workflow run
    const { sha } = context;

    // The owner and repo names of this repository
    const { owner, repo } = context.repo;

    // The prepared URL to the workflow check page
    const log_url = `https://github.com/${owner}/${repo}/commit/${sha}/checks`;

    // Inputs
    const token = getInput('github-token', { required: true });
    const deployment_id = parseInt(
      getInput('deployment-id', { required: true }),
      10
    );
    const description = getInput('description', { required: false });
    const state = getInput('initial-state', {
      required: true,
    }) as DeploymentStatusStates;
    const environment_url = getInput('environment-url', { required: false });

    // the authenticated GitHub client
    const client = getOctokit(token, { previews: ['ant-man', 'flash'] });

    // create the initial deployment status
    const status = await client.repos.createDeploymentStatus({
      owner,
      repo,
      deployment_id,
      state,
      log_url,
      description,
      environment_url,
    });

    setOutput('deployment-status-id', status.data.id.toString());
  } catch (e) {
    error(e);
    setFailed(e.message);
  }
}

run();
