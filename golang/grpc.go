package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"regexp"
	"time"

	pb "zckevin/feishu-xiaoyuzhou/proto/services/feishu/v1"

	"github.com/teris-io/shortid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	GRPC_SERVER        string
	TASK_DEADLINE      = time.Minute * 15
	xiaoyuzhoufm_regex = regexp.MustCompile(`^https:\/\/www\.xiaoyuzhoufm\.com\/episode\/.*`)
)

func init() {
	GRPC_SERVER = os.Getenv("GRPC_SERVER")
	if GRPC_SERVER == "" {
		log.Fatal("GRPC_SERVER missing in .env")
	}
}

func CreateTask(sess *ChatSession, contentString string) (err error) {
	defer func() {
		if err != nil {
			sess.SendMsg(err.Error())
		}
	}()

	log.Println("<=", contentString)
	if !xiaoyuzhoufm_regex.MatchString(contentString) {
		return fmt.Errorf("unsupported command")
	}

	conn, err := grpc.Dial(GRPC_SERVER, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer conn.Close()
	client := pb.NewFeishuTaskServiceClient(conn)

	taskConfig := pb.TaskConfig{
		TaskId:   shortid.MustGenerate(),
		TaskType: pb.TaskType_Xiaoyuzhou,
		Url:      contentString,
	}
	ctx, cancel := context.WithTimeout(context.Background(), TASK_DEADLINE)
	defer cancel()
	stream, err := client.CreateTask(ctx, &taskConfig)
	if err != nil {
		return err
	}
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		log.Println("=>", msg.GetMsg())
		err = sess.SendMsg(msg.GetMsg())
		if err != nil {
			return err
		}
	}
	return nil
}
