#!/usr/bin/env bash
curl 'http://localhost:9000/api/model/update/'$1'?api_key=3c3eed686e&api_secret=4042dcea13' -H 'Content-Type: application/json; charset=UTF-8' --data-binary @-