#!/bin/bash -e

if [[ "$#" -gt 1 ]]; then
  echo "usage: $0 [name]" >&2
  exit 1
elif [[ "$#" -lt 1 ]]; then
  name="$(basename "$(pwd)")"
else
  name="$1"
fi

function _exit() {
  popd &>/dev/null
}

current_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
pushd "$current_dir" &>/dev/null
trap _exit EXIT

git mv template-module.sublime-project "$name.sublime-project"
git grep -lz '(\?TEMPLATE_MODULE)\?' | while read -r -d $'\0' file; do
  if ! [ -z "$(git status --porcelain "$file")" ]; then
    echo "$file has changes - aborting" >&2
    exit 1
  fi
  if [[ "$file" == README.md ]]; then
    node -e 'fs.writeFileSync("README.md",fs.readFileSync("README.md","utf-8").replace(/^.*<!--\s*END_TEMPLATE\s*-->/ms,`# ${process.argv[1]}`))' "$name"
  fi
  sed -i "s/(\?TEMPLATE_MODULE)\?/$(sed -e 's/[\/&]/\\&/g' <<< "$name")/g" "$file"
  git add "$file"
done
git rm init.sh
