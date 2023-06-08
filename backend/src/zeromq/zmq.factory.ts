import { ParamData } from '@nestjs/common';
import { isObject } from 'lodash';
import {
  ZMQ_HEADER_TYPE,
  ZMQ_PARAM_TYPE,
  ZMQ_REQUEST_TYPE,
} from './zmq.constants.js';

export class ZMQRpcParamsFactory {
  public exchangeKeyForValue(type: number, data: ParamData, args: any[]) {
    if (!args) {
      return null;
    }

    let index = 0;
    if (type === ZMQ_PARAM_TYPE) {
      index = 0;
    } else if (type === ZMQ_REQUEST_TYPE) {
      index = 1;
    } else if (type === ZMQ_HEADER_TYPE) {
      index = 2;
    }

    return data && !isObject(data) ? args[index]?.[data] : args[index];
  }
}
