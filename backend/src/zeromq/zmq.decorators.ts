import { Inject } from '@nestjs/common';

// import { makeInjectableDecorator } from '@golevelup/nestjs-common';
// eslint-disable-next-line prettier/prettier
export const makeInjectableDecorator = (token: string | symbol): (() => ParameterDecorator) => () => Inject(token);

import 'reflect-metadata';
import {
  applyDecorators,
  SetMetadata,
  PipeTransform,
  Type,
  assignMetadata,
} from '@nestjs/common';
import { isString } from 'lodash';
import {
  ZMQ_ARGS_METADATA,
  ZMQ_CONFIG_TOKEN,
  ZMQ_HANDLER,
  ZMQ_HEADER_TYPE,
  ZMQ_PARAM_TYPE,
  ZMQ_REQUEST_TYPE,
} from './zmq.constants.js';
import { ZMQHandlerConfig } from './zmq.interfaces';

export const makeZMQDecorator =
  <T extends Partial<ZMQHandlerConfig>>(input: T) =>
  (config: Pick<ZMQHandlerConfig, Exclude<keyof ZMQHandlerConfig, keyof T>>) =>
    applyDecorators(SetMetadata(ZMQ_HANDLER, { ...input, ...config }));

export const ZMQHandler =
  (config: ZMQHandlerConfig) => (target, key, descriptor) =>
    SetMetadata(ZMQ_HANDLER, config)(target, key, descriptor);

export const ZMQSubscribe = makeZMQDecorator({ type: 'sub' });
// TODO: implement RPC?
// export const ZMQRPC = makeZMQDecorator({ type: 'rpc' });

export const InjectZMQConfig = makeInjectableDecorator(ZMQ_CONFIG_TOKEN);

export const createPipesRpcParamDecorator =
  (
    data?: any,
    type: number = ZMQ_PARAM_TYPE,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
  ): ParameterDecorator =>
  (target, key, index) => {
    const args =
      Reflect.getMetadata(ZMQ_ARGS_METADATA, target.constructor, key) || {};

    const hasParamData = isString(data);
    const paramData = hasParamData ? data : undefined;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];

    Reflect.defineMetadata(
      ZMQ_ARGS_METADATA,
      assignMetadata(args, type, index, paramData, ...paramPipes),
      target.constructor,
      key,
    );
  };

// overloads for ZMQPayload
export function ZMQPayload(): ParameterDecorator;
export function ZMQPayload(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function ZMQPayload(
  propertyKey?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function ZMQPayload(
  propertyOrPipe?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesRpcParamDecorator(propertyOrPipe, ZMQ_PARAM_TYPE, ...pipes);
}

// overloads for ZMQHeader
export function ZMQHeader(): ParameterDecorator;
export function ZMQHeader(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function ZMQHeader(
  propertyKey?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function ZMQHeader(
  propertyOrPipe?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesRpcParamDecorator(
    propertyOrPipe,
    ZMQ_HEADER_TYPE,
    ...pipes,
  );
}

// overloads for ZMQRequest
export function ZMQRequest(): ParameterDecorator;
export function ZMQRequest(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function ZMQRequest(
  propertyKey?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function ZMQRequest(
  propertyOrPipe?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesRpcParamDecorator(
    propertyOrPipe,
    ZMQ_REQUEST_TYPE,
    ...pipes,
  );
}
