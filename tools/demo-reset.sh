#!/bin/sh
# Puts the demo back exactly as committed: the snapshot database, its principals, empty source folders
# (so nothing is ingested twice) and a new "epoch" so browsers forget their old chats.
# The LLM cache (data/llm-cache) is kept on purpose: it is what makes a rehearsed demo fast.
# Stop the dev server first: it holds the database open.
set -e
DATA="${DEMO_DATA_DIR:-data}"
cd "$(dirname "$0")/.."

if [ -e "$DATA/brain.db" ] && lsof "$DATA/brain.db" "$DATA/brain.db-wal" >/dev/null 2>&1; then
  echo "The database is open: stop the dev server first, then run this again." >&2
  exit 1
fi

mkdir -p "$DATA/inbox" "$DATA/news" "$DATA/docs"
rm -f "$DATA/brain.db" "$DATA/brain.db-wal" "$DATA/brain.db-shm"
rm -f "$DATA"/inbox/*.md "$DATA"/news/*.md "$DATA"/docs/*.md
cp demo/brain.db "$DATA/brain.db"
cp demo/principals.json "$DATA/principals.json"
date +%s > "$DATA/epoch"
echo "Demo reset: database, principals, source folders and browser chats."
