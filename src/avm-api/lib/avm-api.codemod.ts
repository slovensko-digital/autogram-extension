import { FileInfo, API } from "jscodeshift";

export const parser = "ts";
export default function transformer(file: FileInfo, api: API) {
  const j = api.j;
  const root = j(file.source);

  root.find(j.Comment).forEach((path) => {
    if (path.value.value.length > 5000) {
      path.replace(
        j.commentBlock(path.value.value.split('<img src="data:')[0])
      );
    }
  });

  return root.toSource();
}
