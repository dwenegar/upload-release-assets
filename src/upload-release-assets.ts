import * as core from '@actions/core';
import * as github from '@actions/github';
import {Octokit} from '@octokit/core';
import {getInputs} from './input-helper';
import {findAssetsToUpload} from './search';
import {readFile} from 'fs';
import {promisify} from 'util';

const readFileAsync = promisify(readFile);

export async function uploadReleaseAssets() {
  try {
    const inputs = getInputs();
    const releaseAssets = await findAssetsToUpload(inputs.searchPath);

    if (releaseAssets.length == 0) {
      core.debug(`No files were found with the provided path: ${inputs.searchPath}. No assets will be uploaded.`);
      return;
    }

    const GITHUB_TOKEN: string = process.env.GITHUB_TOKEN as string;
    const octokit: Octokit = github.getOctokit(GITHUB_TOKEN);
    const {owner, repo} = github.context.repo;

    const release = await octokit.repos.getRelease({
      release_id: inputs.releaseId,
      owner: owner,
      repo: repo
    });

    const uploadUrl: string = release.data.upload_url;

    core.debug(`Uploading using ${uploadUrl}`);

    const uploadAsset = async (assetName: string, assetPath: string, contentType: string, contentLength: number) => {
      core.debug(`Uploading ${assetPath} as ${assetName}`);

      const fileContent = await readFileAsync(assetPath);

      const uploadArgs = {
        headers: {
          'content-type': contentType,
          'content-length': contentLength
        },
        url: uploadUrl,
        name: assetName,
        release_id: inputs.releaseId,
        data: fileContent
      };
      await octokit.repos.uploadReleaseAsset(uploadArgs);
    };

    for (const asset of releaseAssets) {
      await uploadAsset(asset.assetName, asset.assetPath, asset.contentType, asset.contentLength);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
