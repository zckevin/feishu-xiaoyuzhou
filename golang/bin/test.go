package main

import (
	"log"
	"os"

	feishu "github.com/buptsb/feishu-xiaoyuzhou"
	"github.com/joho/godotenv"
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

type MockSession struct{}

func (sess *MockSession) SendMsg(payload string) error {
	return nil
}

func main() {
	args := os.Args[1:]
	if len(args) <= 0 {
		panic("no url found in args")
	}
	sess := &MockSession{}
	feishu.CreateTask(sess, args[0], GRPC_SERVER)
}
