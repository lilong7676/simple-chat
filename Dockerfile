FROM node:16
COPY . /usr/local/simple-chat
WORKDIR /usr/local/simple-chat
RUN npm install -g pnpm --registry=https://registry.npm.taobao.org && pnpm i

ENV NODE_ENV production

CMD ["npm","start"]
