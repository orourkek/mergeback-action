import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import {wait} from './wait';

const repository = process.env.GITHUB_REPOSITORY || '';
const [ owner, repo ] = repository.split('/');

// async function branchIsBehind(
//   from: string,
//   to: string,
//   octokit: ReturnType<typeof getOctokit>
// ) {
//   const result = await octokit.rest.repos.compareCommits({
//     owner,
//     repo,
//     base: to,
//     head: from,
//     page: 1,
//     per_page: 1,
//   });
// }

async function run(): Promise<void> {
  try {
    // const token = core.getInput('GITHUB_TOKEN', { required: true });
    // const fromBranch = core.getInput('FROM_BRANCH', { required: true });
    // const toBranch = core.getInput('TO_BRANCH', { required: true });
    const token = process.env.GITHUB_TOKEN || '';
    const fromBranch = 'main';
    const toBranch = 'dev';
    const octokit = getOctokit(token);

    const branchDiffResponse = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base: toBranch,
      head: fromBranch,
    });

    const fromSha = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`
    });
    const numCommitsMissing = branchDiffResponse.data.commits.length;

    console.log(`>>> numCommitsMissing: ${numCommitsMissing}`);
    console.log(`>>> fromSha: `, fromSha);

    if (!numCommitsMissing) {
      console.log(`No commits in ${fromBranch} to merge back into ${toBranch}`);
      return;
    }

    // const mergebackBranch = octokit.rest.git.createRef({
    //   owner,
    //   repo,
    //   ref: `refs/heads/mergeback/`,
    //   sha: '',
    // });

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
