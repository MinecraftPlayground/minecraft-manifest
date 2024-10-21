// deno-lint-ignore-file explicit-module-boundary-types explicit-function-return-type
import {getOctokit} from '@actions/github';

export default function getArtifacts(
    token : string,
    owner : string,
    repo : string
) {
  return getOctokit(token).rest.actions.listArtifactsForRepo({
    owner,
    repo,
  }).then((response) => response.data.artifacts);
}
