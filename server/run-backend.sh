#!/bin/sh
export PATH="/c/Program Files/nodejs:$PATH"
export PORT=5001
export NODE_ENV=development
export MONGODB_URI="mongodb://127.0.0.1:27017/validation_engine"
cd "/c/Users/Tharaneesh.k/Downloads/Validation_engine/server"
"/c/Program Files/nodejs/node.exe" server.js
