import {
  Server,
  ServerWritableStream,
  ServerCredentials,
  UntypedHandleCall,
} from '@grpc/grpc-js';
import { HandleXiaoyuzhouTask } from "../tasks/xiaoyuzhoufm";
import { TaskType, TaskConfig, TaskStatusMsgStream } from '../proto/services/feishu/v1/feishu_service_pb';
import { FeishuTaskServiceService, IFeishuTaskServiceServer } from '../proto/services/feishu/v1/feishu_service_grpc_pb';
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";

export interface ServerStream {
  write(payload: string): void;
}

export class ServerStreamImpl {
  #call: ServerWritableStream<TaskConfig, TaskStatusMsgStream>;
  #taskID: string;

  constructor(call: ServerWritableStream<TaskConfig, TaskStatusMsgStream>) {
    this.#call = call;
    this.#taskID = call.request.getTaskId();
  }

  write(payload: string) {
    const wrappedPayload = `[${this.#taskID}] ${payload}`;
    console.log(wrappedPayload);

    const msg = new TaskStatusMsgStream();
    msg.setMsg(wrappedPayload);
    this.#call.write(msg);
  }
}

type Task = {
  call: ServerWritableStream<TaskConfig, TaskStatusMsgStream>
  serverStream: ServerStreamImpl
}

type TaskNotifier = {
  serverStream: ServerStreamImpl
}

export default class TaskServer implements IFeishuTaskServiceServer {
  [name: string]: UntypedHandleCall;

  #tasks: queueAsPromised<Task> = fastq.promise(this.#handleTask.bind(this), 1);
  #taskNotifiers: Array<TaskNotifier> = [];

  async createTask(call: ServerWritableStream<TaskConfig, TaskStatusMsgStream>) {
    const serverStream = new ServerStreamImpl(call);
    const queueLength = this.#taskNotifiers.length;
    if (queueLength >= 10) {
      serverStream.write("Too many queues tasks, abort.");
      return;
    }
    if (queueLength > 0) {
      serverStream.write(`Wait for ${queueLength} queued tasks to finish.`);
    }
    this.#tasks.push({ call, serverStream })
    this.#taskNotifiers.push({ serverStream })
  }

  async #handleTask(task: Task) {
    const { call, serverStream } = task;
    try {
      const taskType = call.request.getTaskType();
      switch (taskType) {
        case TaskType.XIAOYUZHOU: {
          await HandleXiaoyuzhouTask(call, serverStream);
          break;
        }
        default: {
          throw new Error(`Unimplemented tasktype value: ${taskType}`)
        }
      }
    } catch (err) {
      serverStream.write(err);
      console.log(err);
    }
    this.#taskNotifiers.shift();
    call.end();
  }
}

const grpcServer = new Server();
grpcServer.addService(FeishuTaskServiceService, new TaskServer);

// TODO: use .env to store the host and port
grpcServer.bindAsync('localhost:4000', ServerCredentials.createInsecure(), () => {
  grpcServer.start();
  console.log('server is running on localhost:4000');
});
