import grpc, {
  Server,
  ServerWritableStream,
  ServerCredentials,
} from '@grpc/grpc-js';
import { HandleXiaoyuzhouTask } from "../tasks/xiaoyuzhoufm";
import { TaskType, TaskConfig, TaskStatusMsgStream } from '../proto/services/feishu/v1/feishu_service_pb';
import { FeishuTaskServiceService, IFeishuTaskServiceServer } from '../proto/services/feishu/v1/feishu_service_grpc_pb';

export class ServerStream {
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
  [name: string]: grpc.UntypedHandleCall;

  async createTask(call: ServerWritableStream<TaskConfig, TaskStatusMsgStream>) {
    try {
      const serverStream = new ServerStream(call);
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

const grcpServer = new Server();
grcpServer.addService(FeishuTaskServiceService, new TaskServer);

grcpServer.bindAsync('0.0.0.0:4000', ServerCredentials.createInsecure(), () => {
  grcpServer.start();
  console.log('server is running on 0.0.0.0:4000');
});
