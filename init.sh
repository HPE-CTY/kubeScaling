#!/bin/bash

parent_dir=$(pwd)


cd backend
node app.js &

sleep 5  

cd "$parent_dir"
cd frontend
npm install
npm run dev
