#!/bin/sh

image=simple-chat_server

# 先停止容器运行
docker stop server-simple-chat
docker stop nginx-simple-chat
docker stop mysql-simple-chat
docker stop redis-simple-chat

# 删除镜像
docker image rm -f $image

docker-compose up -d

echo "docker 部署并运行成功"
echo ${image}
