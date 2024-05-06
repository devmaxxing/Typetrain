# Typetrain
A simple multiuser typing game using client authoratative networking with WebSockets in a Discord Activity.

## Local Development
### Setup
1. Create a Discord Application: https://discord.com/developers/docs/activities/building-an-activity#step-1-creating-a-new-app
2. Copy the contents of the `.example.env` files in the `client` and `server` folders to new `.env` files in the same location. Set the `VITE_CLIENT_ID` and `CLIENT_SECRET` environment variables to that of your Discord Application.

### Client
From the `client` directory:
``` bash
npm install
npm run dev
```

### Server
From the `server` directory: `go run .`

### Accessing The App
For debugging purposes, using Discord from a browser (https://discord.com/app) is recommended.
Discord Activities can be accessed in a voice call or voice channel of a server.

See: https://discord.com/developers/docs/activities/development-guides#run-your-application-locally

## TODO
- [ ] Extract translation and login functionality out of server and into Cloudflare Workers

## Credits
- TypingInput component adapted from https://github.com/thisissteven/monkeytype-clone
- Sprites - https://kooky.itch.io/pixel-train
- Soundtrack - [Levente Ungvari](https://www.instagram.com/levente.ungvari)
