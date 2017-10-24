#!/usr/bin/env bash

node transform.js ../data/buses.csv ../data/buses_arr.json
node transform.js ../data/trolls.csv ../data/trolls_arr.json
node transform.js ../data/trams.csv ../data/trams_arr.json
node transform.js ../data/mts.csv ../data/mts_arr.json
