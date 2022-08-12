#!/bin/sh

image=simple-chat_server

docker image rm $image

docker compose up -d

echo "docker 部署并运行成功"
echo ${image}
