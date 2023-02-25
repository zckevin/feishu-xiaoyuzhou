// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var services_feishu_v1_feishu_service_pb = require('../../../services/feishu/v1/feishu_service_pb.js');

function serialize_services_feishu_v1_TaskConfig(arg) {
  if (!(arg instanceof services_feishu_v1_feishu_service_pb.TaskConfig)) {
    throw new Error('Expected argument of type services.feishu.v1.TaskConfig');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_feishu_v1_TaskConfig(buffer_arg) {
  return services_feishu_v1_feishu_service_pb.TaskConfig.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_feishu_v1_TaskStatusMsgStream(arg) {
  if (!(arg instanceof services_feishu_v1_feishu_service_pb.TaskStatusMsgStream)) {
    throw new Error('Expected argument of type services.feishu.v1.TaskStatusMsgStream');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_feishu_v1_TaskStatusMsgStream(buffer_arg) {
  return services_feishu_v1_feishu_service_pb.TaskStatusMsgStream.deserializeBinary(new Uint8Array(buffer_arg));
}


var FeishuTaskServiceService = exports.FeishuTaskServiceService = {
  createTask: {
    path: '/services.feishu.v1.FeishuTaskService/CreateTask',
    requestStream: false,
    responseStream: true,
    requestType: services_feishu_v1_feishu_service_pb.TaskConfig,
    responseType: services_feishu_v1_feishu_service_pb.TaskStatusMsgStream,
    requestSerialize: serialize_services_feishu_v1_TaskConfig,
    requestDeserialize: deserialize_services_feishu_v1_TaskConfig,
    responseSerialize: serialize_services_feishu_v1_TaskStatusMsgStream,
    responseDeserialize: deserialize_services_feishu_v1_TaskStatusMsgStream,
  },
};

exports.FeishuTaskServiceClient = grpc.makeGenericClientConstructor(FeishuTaskServiceService);
