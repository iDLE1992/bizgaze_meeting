
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace BizGazeMeeting.Server
{
    public class BaseHub : Hub
    {
        /***************************Group functions*****************************/
        public async Task AddCallerToGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }

        public async Task RemoveCallerFromGroup(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }

        /***************************send functions*****************************/
        public async Task Broadcast(string proc, object param = null)
        {
            await Clients.All.SendAsync(proc, param);
        }
        public async Task BroadcastExceptCaller(string proc, object param = null)
        {
            await Clients.Others.SendAsync(proc, param);
        }

        public async Task RoomBroadcast(Int64 roomId, string proc, object param = null)
        {
            await Clients.Group(roomId.ToString()).SendAsync(proc, param);
        }
        public async Task RoomBroadcastExceptCaller(Int64 roomId, string proc, object param = null)
        {
            await Clients.OthersInGroup(roomId.ToString()).SendAsync(proc, param);
        }

        public async Task SendMessageToCaller(string proc, object param1 = null, object param2 = null)
        {
            await Clients.Caller.SendAsync(proc, param1, param2);
        }
        public async Task SendMessage(string proc, string sourceId, string destId, object param1 = null, object param2 = null)
        {
            try
            {
                await Clients.Client(destId).SendAsync(proc, sourceId, param1, param2);
            } catch (Exception) { }            
        }

    }
}
