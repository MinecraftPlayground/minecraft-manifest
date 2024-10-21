import type { Latest } from './interface/latest.ts';

/**
 * This function parses the artifact name.
 * @param name The artifact name
 * @param pattern The regex pattern
 * @returns The release and snapshot version
 */
export default function parseArtifactName(
  name : string,
  pattern : RegExp = /manifest@(?<release>.*);(?<snapshot>.*)/gm
) : Latest | undefined {
  return pattern.exec(name)?.groups as unknown as Latest;
}
