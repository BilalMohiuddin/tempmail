#!/usr/bin/env node

// Main server entry point
// This file serves as the entry point for PM2 and other process managers

const path = require('path');

// Set the working directory to the server folder
process.chdir(path.join(__dirname, 'server'));

// Load and run the main server using absolute path
require(path.join(__dirname, 'server', 'index.js')); 