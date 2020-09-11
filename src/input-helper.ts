import * as core from '@actions/core';
import {Inputs} from './constants';
import {UploadInputs} from './upload-inputs';

export function getInputs(): UploadInputs {
  const releaseId = core.getInput(Inputs.ReleaseId, {required: true});
  if (isNaN(Number.parseInt(releaseId))) {
    throw new Error(`Invalid release Id: ${Inputs.ReleaseId}`);
  }

  const searchPath = core.getInput(Inputs.AssetsPath, {required: true});

  return {
    searchPath: searchPath,
    releaseId: Number.parseInt(releaseId)
  };
}
