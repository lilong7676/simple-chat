FROM alpine
COPY . /usr/local/simple-chat-server
WORKDIR /usr/local/simple-chat-server
RUN apk add nodejs npm && npm install -g cnpm --registry=https://registry.npm.taobao.org && cnpm i && npm run tsc
CMD ["npm","start"]