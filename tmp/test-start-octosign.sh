PROTO=https
HOST=localhost
PORT=37200
ORIGIN="*"

TLS_DIR="$HOME/Library/Application Support/Octosign/tls"



ls -lah "$TLS_DIR"

/Applications/Octosign.app/Contents/MacOS/OctosignApp --url="signer://listen?protocol=$PROTO&host=$HOST&port=$PORT&origin=$ORIGIN"
