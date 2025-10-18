#!/bin/bash
set -e

echo "Building the application..."
pnpm build

echo "Starting the application..."
pnpm start
