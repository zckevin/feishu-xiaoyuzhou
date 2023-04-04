import {
  Server,
  ServerWritableStream,
  ServerCredentials,
  UntypedHandleCall,
} from '@grpc/grpc-js';
import { HandleXiaoyuzhouTask } from "../tasks/xiaoyuzhoufm";
import { TaskType, TaskConfig, TaskStatusMsgStream } from '../proto/services/feishu/v1/feishu_service_pb';
import { FeishuTaskServiceService, IFeishuTaskServiceServer } from '../proto/services/feishu/v1/feishu_service_grpc_pb';

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

export default class TaskServer implements IFeishuTaskServiceServer {
  [name: string]: UntypedHandleCall;

  async createTask(call: ServerWritableStream<TaskConfig, TaskStatusMsgStream>) {
    try {
      const serverStream = new ServerStreamImpl(call);
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
      call.end();
    } catch (err) {
      console.log(err);
    }
  }
}

const grpcServer = new Server();
grpcServer.addService(FeishuTaskServiceService, new TaskServer);

// TODO: use .env to store the host and port
grpcServer.bindAsync('100.70.238.72:4000', ServerCredentials.createInsecure(), () => {
  grpcServer.start();
  console.log('server is running on 0.0.0.0:4000');
});
