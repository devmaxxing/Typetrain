import React, { useEffect, useState } from "react";

import { discordSdk } from "./discordSdk";
import type { AsyncReturnType } from "type-fest";
import TypingInput from "./components/TypingInput";
import PreferenceProvider from "./context/Preference/PreferenceContext";

type Auth = AsyncReturnType<typeof discordSdk.commands.authenticate>;

const App = () => {
  const [auth, setAuth] = useState<null | Auth>(null);
  const [websocket, setWebsocket] = useState<null | WebSocket>(null);
  const [scores, setScores] = useState<null | Record<string, number>>(null);

  const audioRef = React.useRef() as React.MutableRefObject<HTMLAudioElement>;
  useEffect(() => {
    const setup = async () => {
      await discordSdk.ready();

      // Authorize with Discord Client
      const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
        scope: [
          // "applications.builds.upload",
          // "applications.builds.read",
          // "applications.store.update",
          // "applications.entitlements",
          // "bot",
          "identify",
          // "connections",
          // "email",
          // "gdm.join",
          "guilds",
          // "guilds.join",
          // "guilds.members.read",
          // "messages.read",
          // "relationships.read",
          // 'rpc.activities.write',
          // "rpc.notifications.read",
          // "rpc.voice.write",
          "rpc.voice.read",
          // "webhook.incoming",
        ],
      });

      // Retrieve an access_token from your activity's server
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });
      const { access_token } = await response.json();

      // Authenticate with Discord client (using the access_token)
      const auth = await discordSdk.commands.authenticate({
        access_token,
      });

      if (auth == null) {
        throw new Error("Authenticate command failed");
      }
      setAuth(auth);
      const instanceId = discordSdk.instanceId;
      const ws = new WebSocket(`/api/connect?instanceId=${instanceId}`);
      ws.onmessage = (event) => {
        console.log(`event: ${JSON.stringify(event.data)}`);
      };
      ws.onopen = () => {
        console.log("ws opened. sending message...");
        ws.send("test");
      };
      setWebsocket(ws);
    };

    setup().then(() => {});
  }, []);
  const inputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
  if (!auth) {
    return <div>Loading...</div>; // or some other loading state
  }
  return (
    <PreferenceProvider>
      <div className="default poppins sm:scrollbar h-screen w-full overflow-y-auto bg-bg transition-colors duration-300">
        <div className="layout flex flex-col items-center pt-36 text-center">
          <TypingInput
            id={auth.user.id}
            socket={websocket}
            ref={inputRef}
            text={`Confucius said, "To learn and to practise what is learned time and again is pleasure is it not? To have friends come from afar is happiness, is it not? To be unperturbed when not appreciated by others is gentlemanly, is it not?"`}
          />
        </div>
      </div>
    </PreferenceProvider>
  );
};

export default App;
