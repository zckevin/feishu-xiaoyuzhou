package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	"github.com/larksuite/oapi-sdk-go/v3/core/httpserverext"
	larkevent "github.com/larksuite/oapi-sdk-go/v3/event"
	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
)

var (
	client *lark.Client
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

type ChatSession struct {
	chatID string
}

func jsonEscape(i string) string {
	b, err := json.Marshal(i)
	if err != nil {
		panic(err)
	}
	s := string(b)
	return s[1 : len(s)-1]
}

func (sess *ChatSession) SendMsg(payload string) error {
	content := larkim.NewTextMsgBuilder().
		Text(jsonEscape(payload)).
		Build()
	resp, err := client.Im.Message.Create(context.Background(), larkim.NewCreateMessageReqBuilder().
		ReceiveIdType(larkim.ReceiveIdTypeChatId).
		Body(larkim.NewCreateMessageReqBodyBuilder().
			MsgType(larkim.MsgTypeText).
			ReceiveId(sess.chatID).
			Content(content).
			Build()).
		Build())
	// 处理错误
	if err != nil {
		return err
	}
	// 服务端错误处理
	if !resp.Success() {
		return fmt.Errorf("code %d: %s", resp.Code, resp.Msg)
	}
	return nil
}

func parseContent(content string) (string, error) {
	//"{\"text\":\"@_user_1  hahaha\"}",
	//only get text content hahaha
	var contentMap map[string]interface{}
	err := json.Unmarshal([]byte(content), &contentMap)
	if err != nil {
		return "", err
	}
	return contentMap["text"].(string), nil
}

func main() {
	client = lark.NewClient(os.Getenv("APP_ID"), os.Getenv("APP_SECRET"))

	//// 注册消息处理器
	handler := dispatcher.NewEventDispatcher(os.Getenv("APP_VERIFICATION_TOKEN"), os.Getenv("APP_ENCRYPT_KEY")).
		OnP2MessageReceiveV1(func(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
			// fmt.Println(larkcore.Prettify(event))
			content := event.Event.Message.Content
			contentStr, err := parseContent(*content)
			if err != nil {
				return err
			}

			sess := &ChatSession{
				chatID: *event.Event.Message.ChatId,
			}
			err = CreateTask(sess, contentStr)
			if err != nil {
				return err
			}
			return nil
		})

	// 注册 http 路由
	http.HandleFunc("/webhook/event",
		httpserverext.NewEventHandlerFunc(handler, larkevent.WithLogLevel(larkcore.LogLevelInfo)))

	// 启动 http 服务
	fmt.Println("http server started", "http://localhost:8080/webhook/event")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
