import { ManifestData } from './interface/manifest_data.ts';

export default function fetchManifestData(url : string) : Promise<ManifestData> {
  return fetch(url).then(async (response) => {
    try {
      return (await (await response.json() as Promise<ManifestData>));
    // deno-lint-ignore no-explicit-any
    } catch (error : any) {
      throw new Error(error)
    }
  })
}
