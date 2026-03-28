/* eslint-disable */
import { FileInfo, API } from "jscodeshift";

export const parser = "ts";
export default function transformer(file: FileInfo, api: API) {
  const j = api.j;
  const root = j(file.source);

  // @ts-expect-error
  root.find(j.Comment).forEach((path) => {
    // @ts-expect-error
    if (path.value.value.length > 5000) {
      path.replace(
        // @ts-expect-error
        j.commentBlock(path.value.value.split('<img src="data:')[0])
      );
    }
  });

  return root.toSource();
}
