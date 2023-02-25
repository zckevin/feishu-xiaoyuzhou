// package: services.feishu.v1
// file: services/feishu/v1/feishu_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class TaskConfig extends jspb.Message { 
    getTaskId(): string;
    setTaskId(value: string): TaskConfig;
    getTaskType(): TaskType;
    setTaskType(value: TaskType): TaskConfig;
    getUrl(): string;
    setUrl(value: string): TaskConfig;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TaskConfig.AsObject;
    static toObject(includeInstance: boolean, msg: TaskConfig): TaskConfig.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TaskConfig, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TaskConfig;
    static deserializeBinaryFromReader(message: TaskConfig, reader: jspb.BinaryReader): TaskConfig;
}

export namespace TaskConfig {
    export type AsObject = {
        taskId: string,
        taskType: TaskType,
        url: string,
    }
}

export class TaskStatusMsgStream extends jspb.Message { 
    getMsg(): string;
    setMsg(value: string): TaskStatusMsgStream;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TaskStatusMsgStream.AsObject;
    static toObject(includeInstance: boolean, msg: TaskStatusMsgStream): TaskStatusMsgStream.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TaskStatusMsgStream, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TaskStatusMsgStream;
    static deserializeBinaryFromReader(message: TaskStatusMsgStream, reader: jspb.BinaryReader): TaskStatusMsgStream;
}

export namespace TaskStatusMsgStream {
    export type AsObject = {
        msg: string,
    }
}

export enum TaskType {
    DUMMY = 0,
    XIAOYUZHOU = 1,
}
