function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
@WebSocketGateway({
  cors: {
    origin: '*'
  },
  namespace: '/notifications'
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  constructor(private jwtService: JwtService) {}
  handleConnection(client: Socket) {
    if (stryMutAct_9fa48("5271")) {
      {}
    } else {
      stryCov_9fa48("5271");
      const token = client.handshake.auth?.token as string | undefined;
      if (stryMutAct_9fa48("5274") ? false : stryMutAct_9fa48("5273") ? true : stryMutAct_9fa48("5272") ? token : (stryCov_9fa48("5272", "5273", "5274"), !token)) {
        if (stryMutAct_9fa48("5275")) {
          {}
        } else {
          stryCov_9fa48("5275");
          client.disconnect();
          return;
        }
      }
      try {
        if (stryMutAct_9fa48("5276")) {
          {}
        } else {
          stryCov_9fa48("5276");
          const payload = this.jwtService.verify<{
            sub: string;
          }>(token);
          client.join(stryMutAct_9fa48("5277") ? `` : (stryCov_9fa48("5277"), `user:${payload.sub}`));
        }
      } catch {
        if (stryMutAct_9fa48("5278")) {
          {}
        } else {
          stryCov_9fa48("5278");
          client.disconnect();
        }
      }
    }
  }
  handleDisconnect(client: Socket) {
    if (stryMutAct_9fa48("5279")) {
      {}
    } else {
      stryCov_9fa48("5279");
      this.logger.debug(stryMutAct_9fa48("5280") ? `` : (stryCov_9fa48("5280"), `Client disconnected: ${client.id}`));
    }
  }
  emitToUser(userId: string, event: string, data: unknown) {
    if (stryMutAct_9fa48("5281")) {
      {}
    } else {
      stryCov_9fa48("5281");
      this.server.to(stryMutAct_9fa48("5282") ? `` : (stryCov_9fa48("5282"), `user:${userId}`)).emit(event, data);
    }
  }
}