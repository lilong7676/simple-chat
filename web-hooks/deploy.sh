#!/bin/sh

DEPLOY_DIR=$(realpath ~/simple-chat-git-repo)

if [ "$1" != "" ]; then
    echo "Webhook mode."
    REPO_URL=$1
    rm -rf $DEPLOY_DIR
    mkdir -p $DEPLOY_DIR
    cd $DEPLOY_DIR

    echo "start clone $REPO_URL"

    git clone $REPO_URL

    echo "git clone done."

    cd ~/simple-chat-git-repo/simple-chat

    sh -x ./build_deploy.sh

    echo "done"

else
    echo "Not webhook mode."
fi
