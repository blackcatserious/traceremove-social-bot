import { Octokit } from '@octokit/rest';

/**
 * Publish content to GitHub repository. Creates issues, updates files, or creates PRs.
 * When `BOT_DRY_RUN` is `true` the function logs the action and returns 'dry-run'.
 */
export async function publishToGitHub(
  text: string, 
  options: {
    action: 'issue' | 'file' | 'pr';
    repo: string;
    owner: string;
    title?: string;
    filePath?: string;
    branch?: string;
  }
): Promise<string> {
  const dry = process.env.BOT_DRY_RUN === 'true';
  if (dry) {
    console.log(`[DRY] GitHub ${options.action}:\nRepo: ${options.owner}/${options.repo}\nTitle: ${options.title}\nContent:\n${text}\n`);
    return 'dry-run';
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GitHub token not configured');

  const octokit = new Octokit({ auth: token });

  switch (options.action) {
    case 'issue':
      const issue = await octokit.rest.issues.create({
        owner: options.owner,
        repo: options.repo,
        title: options.title || 'Automated Content Update',
        body: text
      });
      return issue.data.number.toString();

    case 'file':
      if (!options.filePath) throw new Error('File path required for file action');
      
      let sha: string | undefined;
      try {
        const currentFile = await octokit.rest.repos.getContent({
          owner: options.owner,
          repo: options.repo,
          path: options.filePath,
          ref: options.branch || 'main'
        });
        if ('sha' in currentFile.data) {
          sha = currentFile.data.sha;
        }
      } catch (error) {
      }

      const fileUpdate = await octokit.rest.repos.createOrUpdateFileContents({
        owner: options.owner,
        repo: options.repo,
        path: options.filePath,
        message: `Update ${options.filePath} - ${options.title || 'Automated update'}`,
        content: Buffer.from(text).toString('base64'),
        sha,
        branch: options.branch || 'main'
      });
      return fileUpdate.data.commit.sha || 'unknown';

    case 'pr':
      const pr = await octokit.rest.pulls.create({
        owner: options.owner,
        repo: options.repo,
        title: options.title || 'Automated Content Update',
        body: text,
        head: options.branch || 'automated-update',
        base: 'main'
      });
      return pr.data.number.toString();

    default:
      throw new Error(`Unknown GitHub action: ${options.action}`);
  }
}

/**
 * Create a webhook handler for GitHub events
 */
export async function handleGitHubWebhook(payload: any, event: string): Promise<void> {
  console.log(`GitHub webhook received: ${event}`, payload);
  
  switch (event) {
    case 'push':
      console.log(`Push to ${payload.repository.full_name} on ${payload.ref}`);
      break;
      
    case 'issues':
      console.log(`Issue ${payload.action} in ${payload.repository.full_name}: ${payload.issue.title}`);
      break;
      
    case 'pull_request':
      console.log(`PR ${payload.action} in ${payload.repository.full_name}: ${payload.pull_request.title}`);
      break;
      
    default:
      console.log(`Unhandled webhook event: ${event}`);
  }
}
