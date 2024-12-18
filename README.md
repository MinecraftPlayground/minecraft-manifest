# Minecraft Manifest

[![Check Transpiled JavaScript](https://github.com/MinecraftPlayground/minecraft-manifest/actions/workflows/check_dist.yml/badge.svg)](https://github.com/MinecraftPlayground/minecraft-manifest/actions/workflows/check_dist.yml)
[![Test Latest Build Action](https://github.com/MinecraftPlayground/minecraft-manifest/actions/workflows/test_action.yml/badge.svg)](https://github.com/MinecraftPlayground/minecraft-manifest/actions/workflows/test_action.yml)

A GitHub action to get infos about the minecraft manifest version.

This action fetches the latest release and snapshot version from the [piston-meta.mojang.com API](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json) and compares that with a version, stored in an artifact name, from a previous workflow run.

A big advantage of this action compared to other actions is that no additional files are needed within the repository to cache the latest version. All necessary information is stored in artifact names.

## Input
```yml
- name: 'Test for version change'
  id: 'version-change'
  uses: MinecraftPlayground/minecraft-manifest@main
  with:
    token: ${{secrets.GITHUB_TOKEN}}
    manifest-url: 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
```

| Parameter      | Datatype | Required | Default Value                                                                                                                                | Description                    |
|----------------|:--------:|:--------:|----------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| `token`        | `string` |    yes   |                                                                                                                                              | GitHub token                   |
| `manifest-url` | `string` |    no    | [API URL](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json') | An URL to the version manifest |

## Output
```yml
- name: 'Print output'
  run: |
    echo "Changed: ${{steps.version-change.outputs.version-changed}}"
    echo "Release changed: ${{steps.version-change.outputs.version-release-changed}}"
    echo "Snapshot changed: ${{steps.version-change.outputs.version-snapshot-changed}}"
    echo "Previous release version: ${{steps.version-change.outputs.version-previous-release}}"
    echo "Previous snapshot version: ${{steps.version-change.outputs.version-previous-snapshot}}"
    echo "Current release version: ${{steps.version-change.outputs.version-current-release}}"
    echo "Release version.json URL: ${{steps.version-change.outputs.version-current-release-url}}"
    echo "Current snapshot version: ${{steps.version-change.outputs.version-current-snapshot}}"
    echo "Snapshot version.json URL: ${{steps.version-change.outputs.version-current-snapshot-url}}"
```

| Parameter                      |  Datatype | Description                                           |
|--------------------------------|:---------:|-------------------------------------------------------|
| `version-changed`              | `boolean` | Whether the release or snapshot version has changed   |
| `version-release-changed`      | `boolean` | Whether the release version has changed               |
| `version-snapshot-changed`     | `boolean` | Whether the snapshot version has changed              |
| `version-current-release`      | `string`  | The current Minecraft release version fetched         |
| `version-current-release-url`  | `string`  | The download url of the release version.json file.    |
| `version-current-snapshot`     | `string`  | The current Minecraft snapshot version fetched        |
| `version-current-snapshot-url` | `string`  | The download url of the snapshot version.json file.   |
| `version-previous-release`     | `string`  | The previous Minecraft release version from artifact  |
| `version-previous-snapshot`    | `string`  | The previous Minecraft snapshot version from artifact |

## Usage
```yml
...

permissions:
  contents: write
  actions: read
  checks: write

jobs:
  minecraft-manifest:
    name: 'Minecraft Manifest'
    runs-on: ubuntu-latest      

    steps:
      - name: 'Setup repository (${{github.event.repository.name}})'
        uses: actions/checkout@v4
      
      - name: 'Test for version change'
        id: 'version-change'
        uses: MinecraftPlayground/minecraft-manifest@main
        with:
          token: ${{secrets.GITHUB_TOKEN}} # <- Important!
      
      - name: 'Print output'
        run: |
          echo "Changed: ${{steps.version-change.outputs.version-changed}}"
          echo "Release changed: ${{steps.version-change.outputs.version-release-changed}}"
          echo "Snapshot changed: ${{steps.version-change.outputs.version-snapshot-changed}}"
          echo "Previous release version: ${{steps.version-change.outputs.version-previous-release}}"
          echo "Previous snapshot version: ${{steps.version-change.outputs.version-previous-snapshot}}"
          echo "Current release version: ${{steps.version-change.outputs.version-current-release}}"
          echo "Release version.json URL: ${{steps.version-change.outputs.version-current-release-url}}"
          echo "Current snapshot version: ${{steps.version-change.outputs.version-current-snapshot}}"
          echo "Snapshot version.json URL: ${{steps.version-change.outputs.version-current-snapshot-url}}"


```
