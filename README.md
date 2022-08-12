## a online chat demo

### build with
- React
- Indexeddb(Dexie)
- Socket.io
- Nodejs + Express + typeorm + Mysql + Redis
- Pnpm monorepo
- docker compose


### features:
- user register & login
- single chat

### start dev:

```
$ pnpm install && npm run dev-server && npm run dev-static
```
then open *localhost:4000* in browser.

### build for production:
```
$ docker compose up
```
then open *localhost* in browser.
