
#!/bin/bash

set +e

pushd $(dirname $0)

../../node_modules/.bin/microbundle \
  --entry worker.js \
  --output temp.umd.js \
  --format umd \
  --sourcemap false \
  --generateTypes false \
  --external none

rm -f built-worker.js
touch built-worker.js

echo 'export default URL.createObjectURL(new Blob([`' >> built-worker.js
cat temp.umd.js >> built-worker.js
echo '`], { type: "text/javascript" }));' >> built-worker.js

rm -f temp.umd.js
# FIXME: don't generate these files:

popd
