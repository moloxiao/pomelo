var Service = function(app, opts) {
  if (!(this instanceof Service)) {
    return new Service(app, opts);
  }

  opts = opts || {};
  this.app = app;
};

module.exports = Service;

Service.prototype.schedule = function(reqId, route, msg, recvs, opts, cb) {
  opts = opts || {};
  if(opts.isBroadcast) {
    doBroadcast(this, msg, opts);
  } else {
    doBatchPush(this, msg, recvs);
  }

  if(cb) {
    process.process.nextTick(function() {
      cb();
    });
  }
};

var doBroadcast = function(self, msg, opts) {
  var channelService = self.app.get('channelService');
  var sessionService = self.app.get('sessionService');

  if(opts.binded) {
    sessionService.forEachBindedSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessageByUid(session.uid, msg);
    });
  } else {
    sessionService.forEachSession(function(session) {
      if(channelService.broadcastFilter &&
         !channelService.broadcastFilter(session, msg, opts.filterParam)) {
        return;
      }

      sessionService.sendMessage(session.id, msg);
    });
  }
};

var doBatchPush = function(self, msg, recvs) {
  var sessionService = self.app.get('sessionService');
  for(var i=0, l=recvs.length; i<l; i++) {
    sessionService.sendMessage(recvs[i], msg);
  }
};