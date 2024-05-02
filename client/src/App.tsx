import React, { useEffect, useState } from "react";

import { discordSdk } from "./discordSdk";
import type { AsyncReturnType } from "type-fest";
import TypingInput from "./components/TypingInput";
import PreferenceProvider from "./context/Preference/PreferenceContext";

type Auth = AsyncReturnType<typeof discordSdk.commands.authenticate>;

const App = () => {
  const paragraphs = `
The Master "Is it not pleasant to learn with a constant perseverance
and application? Is it not delightful to have friends coming from distant quarters? Is he not a man of complete virtue, who feels no discomposure though
men may take no note of him?"

The philosopher Yu said, "They are few who, being filial and fraternal,
are fond of offending against their superiors. There have been none,
who, not liking to offend against their superiors, have been fond
of stirring up confusion.

"The superior man bends his attention to what is radical. That being
established, all practical courses naturally grow up. Filial piety
and fraternal submission,-are they not the root of all benevolent
actions?"

The Master said, "Fine words and an insinuating appearance are seldom
associated with true virtue."

The philosopher Tsang said, "I daily examine myself on three points:-whether,
in transacting business for others, I may have been not faithful;-whether,
in intercourse with friends, I may have been not sincere;-whether
I may have not mastered and practiced the instructions of my teacher."

The Master said, "To rule a country of a thousand chariots, there
must be reverent attention to business, and sincerity; economy in
expenditure, and love for men; and the employment of the people at
the proper seasons."

The Master said, "A youth, when at home, should be filial, and, abroad,
respectful to his elders. He should be earnest and truthful. He should
overflow in love to all, and cultivate the friendship of the good.
When he has time and opportunity, after the performance of these things,
he should employ them in polite studies."

Tsze-hsia said, "If a man withdraws his mind from the love of beauty,
and applies it as sincerely to the love of the virtuous; if, in serving
his parents, he can exert his utmost strength; if, in serving his
prince, he can devote his life; if, in his intercourse with his friends,
his words are sincere:-although men say that he has not learned, I
will certainly say that he has. 

The Master said, "If the scholar be not grave, he will not call forth
any veneration, and his learning will not be solid. 

"Hold faithfulness and sincerity as first principles. 
"Have no friends not equal to yourself. 
"When you have faults, do not fear to abandon them." 
The philosopher Tsang said, "Let there be a careful attention to perform
the funeral rites to parents, and let them be followed when long gone
with the ceremonies of sacrifice;-then the virtue of the people will
resume its proper excellence." 

Tsze-ch'in asked Tsze-kung saying, "When our master comes to any country,
he does not fail to learn all about its government. Does he ask his
information? or is it given to him?" 

Tsze-kung said, "Our master is benign, upright, courteous, temperate,
and complaisant and thus he gets his information. The master's mode
of asking information,-is it not different from that of other men?"

The Master said, "While a man's father is alive, look at the bent
of his will; when his father is dead, look at his conduct. If for
three years he does not alter from the way of his father, he may be
called filial." 

The philosopher Yu said, "In practicing the rules of propriety, a
natural ease is to be prized. In the ways prescribed by the ancient
kings, this is the excellent quality, and in things small and great
we follow them. 

"Yet it is not to be observed in all cases. If one, knowing how such
ease should be prized, manifests it, without regulating it by the
rules of propriety, this likewise is not to be done." 

The philosopher Yu said, "When agreements are made according to what
is right, what is spoken can be made good. When respect is shown according
to what is proper, one keeps far from shame and disgrace. When the
parties upon whom a man leans are proper persons to be intimate with,
he can make them his guides and masters." 

The Master said, "He who aims to be a man of complete virtue in his
food does not seek to gratify his appetite, nor in his dwelling place
does he seek the appliances of ease; he is earnest in what he is doing,
and careful in his speech; he frequents the company of men of principle
that he may be rectified:-such a person may be said indeed to love
to learn." 

Tsze-kung said, "What do you pronounce concerning the poor man who
yet does not flatter, and the rich man who is not proud?" The Master
replied, "They will do; but they are not equal to him, who, though
poor, is yet cheerful, and to him, who, though rich, loves the rules
of propriety." 

Tsze-kung replied, "It is said in the Book of Poetry, 'As you cut
and then file, as you carve and then polish.'-The meaning is the same,
I apprehend, as that which you have just expressed." 

The Master said, "With one like Ts'ze, I can begin to talk about the
odes. I told him one point, and he knew its proper sequence."

The Master said, "I will not be afflicted at men's not knowing me;
I will be afflicted that I do not know men." 
`
    .split("\n\n")
    .map((p) => p.replaceAll("\n", " ").trim());
  const [auth, setAuth] = useState<null | Auth>(null);
  const [websocket, setWebsocket] = useState<null | WebSocket>(null);
  const [scores, setScores] = useState<Record<string, [number, number]>>({});
  const [paragraphIndex, setParagraphIndex] = useState<number>(0);
  const [text, setText] = useState<string>(paragraphs[0]);
  const [language, setLanguage] = useState<string>("EN");
  const audio = new Audio("/KONG_STRUCTURE_94BPM.mp3");
  audio.loop = true;

  const supportedLanguages = {
    AR: "العربية",
    BG: "Български",
    CS: "Čeština",
    DA: "Dansk",
    DE: "Deutsch",
    EL: "Ελληνικά",
    EN: "English",
    ES: "Español",
    ET: "Eesti",
    FI: "Suomi",
    FR: "Français",
    HU: "Magyar",
    ID: "Bahasa Indonesia",
    IT: "Italiano",
    JA: "日本語",
    KO: "한국어",
    LT: "Lietuvių",
    LV: "Latviešu",
    NB: "Norsk Bokmål",
    NL: "Nederlands",
    PL: "Polski",
    PT: "Português",
    RO: "Română",
    RU: "Русский",
    SK: "Slovenčina",
    SL: "Slovenščina",
    SV: "Svenska",
    TR: "Türkçe",
    UK: "Українська",
    ZH: "中文",
  };

  useEffect(() => {
    console.log(scores);
  }, [scores]);

  useEffect(() => {
    audio.play();
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
      setScores({ [auth.user.id]: [0, 0] });
      const ws = new WebSocket(
        `wss://${
          import.meta.env.VITE_CLIENT_ID
        }.discordsays.com/api/connect?instanceId=${instanceId}&userId=${
          auth.user.id
        }`
      );
      ws.onmessage = (event) => {
        const data = event.data.split("\n");
        const newScores: Record<string, [number, number]> = {};
        for (const entry of data) {
          if (entry !== "") {
            const [userId, score, wpm] = entry.split(" ");
            newScores[userId] = [parseInt(score), parseFloat(wpm)];
          }
        }
        setScores((prev) => ({ ...prev, ...newScores }));
      };
      ws.onopen = () => {
        ws.send([auth.user.id, 0, 0].join(" "));
      };
      setWebsocket(ws);
    };

    setup().then(() => {});
  }, []);

  useEffect(() => {
    const translate = async (text: string, lang: string) => {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [text],
          target_lang: lang,
        }),
      })
        .then((response) => response.json())
        .then((data) => data.translations[0].text)
        .catch((error) => console.error("Error:", error));
      return response;
    };
    if (paragraphIndex < paragraphs.length) {
      let paragraph = paragraphs[paragraphIndex];
      if (language !== "EN") {
        translate(paragraph, language).then((translated) => {
          setText(translated);
        });
      } else {
        setText(paragraphs[paragraphIndex]);
      }
    }
  }, [paragraphIndex, language]);

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
            text={text}
          />
          <div className="p-5">
            <button
              className="mx-5"
              onClick={() => {
                setParagraphIndex((prev) => (prev - 1) % paragraphs.length);
              }}
            >
              {"<--"}
            </button>
            <button
              className="mx-5"
              onClick={() => {
                setParagraphIndex((prev) => (prev + 1) % paragraphs.length);
              }}
            >
              {"-->"}
            </button>
          </div>
          <div className="mt-5">
            <label htmlFor="language">Language: </label>
            <select
              name="language"
              id="language"
              onChange={(e) => setLanguage(e.target.value)}
              defaultValue="EN"
            >
              {Object.entries(supportedLanguages).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </PreferenceProvider>
  );
};

export default App;
