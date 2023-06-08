// import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
// import { Logger } from '@nestjs/common';

// export class Libp2pClient extends ClientProxy {
//   protected readonly logger = new Logger(Libp2pClient.name);

//   constructor(private readonly client: any) {
//     super();
//   }

//   protected async dispatchEvent(packet: ReadPacket): Promise<any> {
//     return this.client.send(packet.pattern, packet.data);
//   }

//   protected publish(packet: ReadPacket, callback: (packet: WritePacket) => void): Function {
//     return this.client.send(packet.pattern, packet.data, callback);
//   }

//   protected async sendSingleMessage(packet: ReadPacket): Promise<any> {
//     return this.client.send(packet.pattern, packet.data);
//   }
// }
