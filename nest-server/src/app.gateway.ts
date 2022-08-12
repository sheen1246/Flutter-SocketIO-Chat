import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Server } from 'socket.io';

const PORT = 8090;
  
@WebSocketGateway(PORT, { transports: ['websocket'], allowEIO3: true, cors: { origin: /.*/, credentials: true } })
export class AppGateway implements NestGateway {
    constructor() {}

    allUsers = [];

    afterInit(server: Server) {
        console.log('Chat Server up and running at', PORT);
    }

    handleConnection(socket: any) {
        const query = socket.handshake.query;
        this.allUsers.push(query.userName);
        this.emitUsers(socket);
        var msg = `🔥👤 ${query.userName} has joined! 😎🔥`;
        console.log(msg);
        process.nextTick(async () => {
          socket.emit('message', msg);
        });
    }
    
    handleDisconnect(socket: any) {
        const query = socket.handshake.query;
        var disMsg = `${query.userName} has disconnected! 😭😭`;
        console.log(disMsg);
        process.nextTick(async () => {
            socket.emit('message', disMsg);
        });

        this.removeUser(query.userName);
        this.emitUsers(socket);
    }

    emitUsers(socket: any) {
        socket.emit('users', this.allUsers);    
        console.log('users', this.allUsers);
    }

    removeUser(user: any) {
        this.allUsers = this.allUsers.filter(function(ele){ 
            return ele != user; 
        });   
    }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data) {
        console.log(`👤 ${data.userName} : ${data.message}`)
        this.server.emit('message', data);
    }
}