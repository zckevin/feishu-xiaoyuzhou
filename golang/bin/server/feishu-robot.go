package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"

	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	"github.com/larksuite/oapi-sdk-go/v3/core/httpserverext"
	larkevent "github.com/larksuite/oapi-sdk-go/v3/event"
	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"

	feishu "github.com/buptsb/feishu-xiaoyuzhou"
)

var (
	GRPC_SERVER string
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	GRPC_SERVER = os.Getenv("GRPC_SERVER")
	if GRPC_SERVER == "" {
		log.Fatal("GRPC_SERVER missing in .env")
	}
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

func parseTimestampMillisecondString(s string) (time.Time, error) {
	num, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return time.Time{}, err
	}
	return time.UnixMilli(num), nil
}

func isStaleEvent(eventCreateTime time.Time) bool {
	duration := time.Since(eventCreateTime)
	return duration > time.Second*3
}

func main() {
	feishu.LarkClient = lark.NewClient(os.Getenv("APP_ID"), os.Getenv("APP_SECRET"))

	//// 注册消息处理器
	handler := dispatcher.NewEventDispatcher(os.Getenv("APP_VERIFICATION_TOKEN"), os.Getenv("APP_ENCRYPT_KEY")).
		OnP2MessageReceiveV1(func(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
			// fmt.Println(larkcore.Prettify(event))
			eventCreateTime, err := parseTimestampMillisecondString(*event.Event.Message.CreateTime)
			if err != nil {
				return err
			}
			// fmt.Printf("@%s %v\n", *event.Event.Message.MessageId, eventCreateTime)
			if isStaleEvent(eventCreateTime) {
				return fmt.Errorf("stale event for %v", time.Since(eventCreateTime))
			}

			content := event.Event.Message.Content
			contentStr, err := parseContent(*content)
			if err != nil {
				return err
			}
			sess := &feishu.ChatSession{
				ChatID: *event.Event.Message.ChatId,
			}
			err = feishu.CreateTask(sess, contentStr, GRPC_SERVER)
			if err != nil {
				return err
			}
			return nil
		})

	// 注册 http 路由
	http.HandleFunc("/webhook/event",
		httpserverext.NewEventHandlerFunc(handler, larkevent.WithLogLevel(larkcore.LogLevelInfo)))

	// 启动 http 服务
	fmt.Println("http server started", "http://localhost:9090/webhook/event")

	err := http.ListenAndServe("localhost:9091", nil)
	if err != nil {
		panic(err)
	}
}
