// package: services.feishu.v1
// file: services/feishu/v1/feishu_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as services_feishu_v1_feishu_service_pb from "../../../services/feishu/v1/feishu_service_pb";

interface IFeishuTaskServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createTask: IFeishuTaskServiceService_ICreateTask;
}

interface IFeishuTaskServiceService_ICreateTask extends grpc.MethodDefinition<services_feishu_v1_feishu_service_pb.TaskConfig, services_feishu_v1_feishu_service_pb.TaskStatusMsgStream> {
    path: "/services.feishu.v1.FeishuTaskService/CreateTask";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<services_feishu_v1_feishu_service_pb.TaskConfig>;
    requestDeserialize: grpc.deserialize<services_feishu_v1_feishu_service_pb.TaskConfig>;
    responseSerialize: grpc.serialize<services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
    responseDeserialize: grpc.deserialize<services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
}

export const FeishuTaskServiceService: IFeishuTaskServiceService;

export interface IFeishuTaskServiceServer extends grpc.UntypedServiceImplementation {
    createTask: grpc.handleServerStreamingCall<services_feishu_v1_feishu_service_pb.TaskConfig, services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
}

export interface IFeishuTaskServiceClient {
    createTask(request: services_feishu_v1_feishu_service_pb.TaskConfig, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
    createTask(request: services_feishu_v1_feishu_service_pb.TaskConfig, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
}

export class FeishuTaskServiceClient extends grpc.Client implements IFeishuTaskServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createTask(request: services_feishu_v1_feishu_service_pb.TaskConfig, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
    public createTask(request: services_feishu_v1_feishu_service_pb.TaskConfig, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<services_feishu_v1_feishu_service_pb.TaskStatusMsgStream>;
}
