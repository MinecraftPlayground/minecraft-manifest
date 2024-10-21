import * as actionsCore from '@actions/core';
import * as actionsGithub from '@actions/github';
import * as actionsArtifact from '@actions/artifact';
import * as fs from 'fs/promises';

import fetchManifestData from './fetch_manifest_data.ts';
import getArtifacts from './get_artifacts.ts';
import parseArtifactName from './parse_artifact_name.ts';


const artifactClient = new actionsArtifact.DefaultArtifactClient();

const inputManifestURL = actionsCore.getInput('manifest-url');
const githubToken = actionsCore.getInput('token');

const repositoryOwner = actionsGithub.context.repo.owner;
const repositoryName = actionsGithub.context.repo.repo;

(async () => {
  actionsCore.startGroup(`Fetching current manifest version from "${inputManifestURL}" ...`)
  const currentManifest = await fetchManifestData(inputManifestURL);
  const releaseVersion = currentManifest.versions.find(version => version.id === currentManifest.latest.release);
  const snapshotVersion = currentManifest.versions.find(version => version.id === currentManifest.latest.snapshot);
  actionsCore.info('Found latest version:');
  actionsCore.info(`- Release: ${currentManifest.latest.release} (url: ${releaseVersion?.url})`);
  actionsCore.info(`- Snapshot: ${currentManifest.latest.snapshot} (url: ${snapshotVersion?.url})`);
  actionsCore.endGroup();

  actionsCore.setOutput('version-current-release', currentManifest.latest.release);
  actionsCore.setOutput('version-current-release-url', releaseVersion?.url);
  actionsCore.setOutput('version-current-snapshot', currentManifest.latest.snapshot);
  actionsCore.setOutput('version-current-snapshot-url', snapshotVersion?.url);
  
  actionsCore.startGroup('Getting artifacts ...');
  actionsCore.info('Searching existing artifacts ...');

  const artifacts = await getArtifacts(
    githubToken,
    repositoryOwner,
    repositoryName
  );

  actionsCore.info(`Found ${artifacts.length} artifact${artifacts.length === 1 ? '' : 's'}.`);

  const previousArtifact = artifacts.filter((artifact) => artifact.name.startsWith('manifest@'))[0];

  if (previousArtifact) {
    const previousManifest = parseArtifactName(previousArtifact.name);
    actionsCore.info('Previous artifact:');
    actionsCore.info(`- Name: "${previousArtifact.name}" (release: ${previousManifest?.release}; snapshot: ${previousManifest?.snapshot})`);
    actionsCore.info(`- ID: ${previousArtifact.id}`);
    actionsCore.info(`- Node ID: ${previousArtifact.node_id}`);
    actionsCore.info(`- Workflow ID: ${previousArtifact.workflow_run?.id}`);
    actionsCore.info(`- Created at: ${new Date(previousArtifact.created_at ?? '').toLocaleString()}`);
    actionsCore.info(`- Expires at: ${new Date(previousArtifact.created_at ?? '').toLocaleString()}`);
    actionsCore.info(`- Download: ${previousArtifact.archive_download_url}`);

    actionsCore.endGroup();

    const versionRelaseChanged = previousManifest?.release !== currentManifest.latest.release;
    const versionSnapshotChanged = previousManifest?.snapshot !== currentManifest.latest.snapshot;
    const versionChanged = versionRelaseChanged || versionSnapshotChanged;
      
    actionsCore.setOutput('version-changed', versionChanged);
    actionsCore.setOutput('version-release-changed', versionRelaseChanged);
    actionsCore.setOutput('version-snapshot-changed', versionSnapshotChanged);
    actionsCore.setOutput('version-previous-release', previousManifest?.release);
    actionsCore.setOutput('version-previous-snapshot', previousManifest?.snapshot);
  } else {
    actionsCore.info('No previous artifact found.');
  }

  actionsCore.endGroup();

  actionsCore.startGroup('Creating empty file ...');
  await fs.writeFile(
    './empty',
    ''
  ).catch((reason) => {
    actionsCore.info('Error while executing "writeFile":');
    actionsCore.error(reason);
  });
  actionsCore.endGroup();
  
  actionsCore.startGroup('Uploading new current artifacts ...');
  await artifactClient.uploadArtifact(
    `manifest@${currentManifest.latest.release};${currentManifest.latest.snapshot}`,
    ['./empty'],
    './'
  )
  actionsCore.endGroup();
})()
