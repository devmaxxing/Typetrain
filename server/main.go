package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/lxzan/gws"
	csmap "github.com/mhmtszr/concurrent-swiss-map"
)

type DiscordTokenRequest struct {
	Code string `json:"code"`
}

type DiscordOAuthResponse struct {
	AccessToken string `json:"access_token"`
}

var socketInstance = csmap.Create[*gws.Conn, string]()
var instanceConns = csmap.Create[string, *csmap.CsMap[*gws.Conn, string]]()

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	port := os.Getenv("PORT")
	apiEndpoint := os.Getenv("API_ENDPOINT")
	if port == "" {
		port = "3001" // Default port if not specified
	}
	clientID := os.Getenv("VITE_CLIENT_ID")
	clientSecret := os.Getenv("CLIENT_SECRET")

	http.HandleFunc(apiEndpoint+"/token", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			var t DiscordTokenRequest
			err := json.NewDecoder(r.Body).Decode(&t)
			if err != nil {
				log.Printf("Error parsing form: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			log.Printf("Token request: %v", t)

			data := url.Values{}
			data.Set("client_id", clientID)
			data.Set("client_secret", clientSecret)
			data.Set("grant_type", "authorization_code")
			data.Set("code", t.Code)

			resp, err := http.PostForm("https://discord.com/api/oauth2/token", data)
			if err != nil {
				log.Printf("Error fetching token: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Printf("Error reading response body: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			defer resp.Body.Close()

			var result DiscordOAuthResponse
			json.Unmarshal(body, &result)
			log.Printf("Token response: %v", result)

			json.NewEncoder(w).Encode(result)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	})

	upgrader := gws.NewUpgrader(&Handler{}, &gws.ServerOption{
		ParallelEnabled:   true,                                 // Parallel message processing
		Recovery:          gws.Recovery,                         // Exception recovery
		PermessageDeflate: gws.PermessageDeflate{Enabled: true}, // Enable compression
	})
	http.HandleFunc(apiEndpoint+"/connect", func(writer http.ResponseWriter, request *http.Request) {
		socket, err := upgrader.Upgrade(writer, request)
		if err != nil {
			return
		}
		instanceId := request.URL.Query().Get("instanceId")
		userId := request.URL.Query().Get("userId")
		socketInstance.Store(socket, instanceId)
		var groupMap *csmap.CsMap[*gws.Conn, string] = nil
		if instanceConns.Has(instanceId) {
			loadedMap, _ := instanceConns.Load(instanceId)
			groupMap = loadedMap
			groupMap.Store(socket, userId)
		} else {
			groupMap = csmap.Create[*gws.Conn, string](
				csmap.WithShardCount[*gws.Conn, string](1),
			)
			instanceConns.Store(instanceId, groupMap)
			groupMap.Store(socket, userId)
		}
		log.Printf("New connection from %s clients: %d", instanceId, groupMap.Count())
		go func() {
			socket.ReadLoop() // Blocking prevents the context from being GC.
		}()
	})
	http.HandleFunc(apiEndpoint+"/translate", func(writer http.ResponseWriter, request *http.Request) {
		if request.Method == "POST" {
			req, _ := http.NewRequest("POST", "https://api-free.deepl.com/v2/translate", request.Body)
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "DeepL-Auth-Key "+os.Getenv("DEEPL_API_KEY"))
			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil {
				log.Printf("Error translating text: %v", err)
				writer.WriteHeader(http.StatusInternalServerError)
				return
			}
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Printf("Error reading translation response: %v", err)
				writer.WriteHeader(http.StatusInternalServerError)
				return
			}
			defer resp.Body.Close()
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			writer.Write(body)
		}
	})

	log.Printf("App is listening on port %s!", port)
	http.ListenAndServe(":"+port, nil)
}

const (
	PingInterval = 5 * time.Second
	PingWait     = 10 * time.Second
)

type Handler struct{}

func (c *Handler) OnOpen(socket *gws.Conn) {}

func (c *Handler) OnClose(socket *gws.Conn, err error) {
	instanceId, _ := socketInstance.Load(socket)
	val, _ := instanceConns.Load(instanceId)
	log.Printf("Connection closed from %s clients: %d", instanceId, val.Count()-1)
	val.Delete(socket)
}

func (c *Handler) OnPing(socket *gws.Conn, payload []byte) {}

func (c *Handler) OnPong(socket *gws.Conn, payload []byte) {}

func (c *Handler) OnMessage(socket *gws.Conn, message *gws.Message) {
	defer message.Close()
	instanceId, _ := socketInstance.Load(socket)
	val, _ := instanceConns.Load(instanceId)
	var b = gws.NewBroadcaster(message.Opcode, message.Bytes())
	defer b.Close()

	log.Printf("Broadcasting to %s message: %s clients: %d", instanceId, string(message.Bytes()), val.Count())

	val.Range(func(key *gws.Conn, _ string) (stop bool) {
		b.Broadcast(key)
		return false
	})
}
