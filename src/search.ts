import * as glob from '@actions/glob';
import * as path from 'path';

import {info} from '@actions/core';
import {stat} from 'fs';
import {promisify} from 'util';
import * as mime from 'mime';

const stats = promisify(stat);

export interface ReleaseAsset {
  assetPath: string;
  assetName: string;
  contentLength: number;
  contentType: string;
}

function getDefaultGlobOptions(): glob.GlobOptions {
  return {
    followSymbolicLinks: true,
    implicitDescendants: true,
    omitBrokenSymbolicLinks: true
  };
}

export async function findAssetsToUpload(searchPath: string): Promise<ReleaseAsset[]> {
  const result: ReleaseAsset[] = [];

  const globber = await glob.create(searchPath, getDefaultGlobOptions());

  const assetPaths: string[] = await globber.glob();

  const seen = new Set<string>();
  for (const assetPath of assetPaths) {
    const fileStats = await stats(assetPath);
    if (fileStats.isDirectory()) {
      continue;
    }

    const assetName: string = path.basename(assetPath);

    const lowerCaseAsssetName: string = assetName.toLowerCase();
    if (seen.has(lowerCaseAsssetName)) {
      info(`Uploads are case insensitive: ${assetName} will be overwritten by another file with the same name`);
    } else {
      seen.add(lowerCaseAsssetName);
    }

    const asset: ReleaseAsset = {
      assetName: assetName,
      assetPath: assetPath,
      contentLength: fileStats.size,
      contentType: mime.getType(assetPath) || ''
    };
    result.push(asset);
  }

  return result;
}
