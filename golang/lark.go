package feishu_xiaoyuzhou

import (
	"context"
	"encoding/json"
	"fmt"

	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
)

var (
	LarkClient *lark.Client
)

func jsonEscape(i string) string {
	b, err := json.Marshal(i)
	if err != nil {
		panic(err)
	}
	s := string(b)
	return s[1 : len(s)-1]
}

type ChatSession struct {
	ChatID string
}

func (sess *ChatSession) SendMsg(payload string) error {
	content := larkim.NewTextMsgBuilder().
		Text(jsonEscape(payload)).
		Build()
	resp, err := LarkClient.Im.Message.Create(context.Background(), larkim.NewCreateMessageReqBuilder().
		ReceiveIdType(larkim.ReceiveIdTypeChatId).
		Body(larkim.NewCreateMessageReqBodyBuilder().
			MsgType(larkim.MsgTypeText).
			ReceiveId(sess.ChatID).
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
