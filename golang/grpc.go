package feishu_xiaoyuzhou

import (
	"context"
	"fmt"
	"io"
	"log"
	"regexp"
	"time"

	pb "github.com/buptsb/feishu-xiaoyuzhou/proto/services/feishu/v1"

	"github.com/teris-io/shortid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	TASK_DEADLINE      = time.Minute * 15
	xiaoyuzhoufm_regex = regexp.MustCompile(`^https:\/\/www\.xiaoyuzhoufm\.com\/episode\/.*`)
)

type ISession interface {
	SendMsg(payload string) error
}

func CreateTask(sess ISession, contentString, grpcServer string) (err error) {
	defer func() {
		if err != nil {
			sess.SendMsg(err.Error())
		}
	}()

	log.Println("<=", contentString)
	if !xiaoyuzhoufm_regex.MatchString(contentString) {
		return fmt.Errorf("unsupported command")
	}

	conn, err := grpc.Dial(grpcServer, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
