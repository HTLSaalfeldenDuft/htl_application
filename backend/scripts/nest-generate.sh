#!/bin/bash
sudo docker-compose exec --user 1000 backend sh -c "npm run nest generate $@"
