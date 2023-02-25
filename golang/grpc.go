package main

import (
	"context"
	"io"
	"log"
	"os"
	"time"

	pb "zckevin/feishu-xiaoyuzhou/proto/services/feishu/v1"

	"github.com/teris-io/shortid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	TASK_DEADLINE = time.Minute * 15
	GRPC_SERVER   string
)

func init() {
	GRPC_SERVER = os.Getenv("GRPC_SERVER")
	if GRPC_SERVER == "" {
		log.Fatal("GRPC_SERVER missing in .env")
	}
}

func CreateTask(sess *ChatSession, contentString string) error {
	log.Println("<=", contentString)
	taskConfig := pb.TaskConfig{
		TaskId:   shortid.MustGenerate(),
		TaskType: pb.TaskType_Xiaoyuzhou,
		Url:      contentString,
	}
	conn, err := grpc.Dial(GRPC_SERVER, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer conn.Close()
	client := pb.NewFeishuTaskServiceClient(conn)
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
