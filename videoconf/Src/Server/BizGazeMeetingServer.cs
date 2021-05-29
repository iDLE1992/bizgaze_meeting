
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using BizGazeMeeting.Model;
using BizGazeMeeting.Services;
using BizGazeMeeting.DbModels;

namespace BizGazeMeeting.Server
{
    public class BizGazeMeetingServer : BaseHub
    {
        public BizGazeMeetingServer(MeetingService meetingService, LogService logService)
        {
            roomMgr.setMeetingService(meetingService);
            roomMgr.setLogService(logService);
        }

        //global instance
        //static is very important
        //if not static, liveRoomList can't reside on memory
        private static RoomManager roomMgr = new RoomManager();

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            _ = LeaveRoom();
            return base.OnDisconnectedAsync(exception);
        }

        /**
	    * **************************************************************************
	    *              
	    *              strUserId should "0" for the anonymous
	    *          
	    * **************************************************************************
	    */
        public async Task Join(string strRoomId, string strUserId, string anonymousUserName)
        {
            if (!Int64.TryParse(strRoomId, out Int64 roomId))
            {
                await SendMessageToCaller(Protocol.BGtoUser.ERROR, "room doesn't exist");
            }

            if (!Int64.TryParse(strUserId, out Int64 userId))
            {
                await SendMessageToCaller(Protocol.BGtoUser.ERROR, "user doesn't exist");
            }

            var room = roomMgr.getRoomById(roomId);
            if (room ==null)
            {
                room = roomMgr.CreateRoom(roomId);
            }

            //check if valid user
            if (room != null)
            {
                var joinedClient = roomMgr.JoinClientToRoom(roomId, userId, anonymousUserName, Context.ConnectionId);
                if (joinedClient != null)
                {
                    //add to session group
                    await AddCallerToGroup(roomId.ToString());

                    //notify joinsuccess to caller
                    await SendMessageToCaller(
                        Protocol.BGtoUser.ROOM_JOINED, 
                        JsonConvert.SerializeObject(room.getInfo()), 
                        JsonConvert.SerializeObject(joinedClient.getInfo()));

                    //notify this client's join to every members in this room
                    await RoomBroadcastExceptCaller(
                        roomId, 
                        Protocol.BGtoUser.ROOM_USER_JOINED, 
                        JsonConvert.SerializeObject(joinedClient.getInfo()));
                }
                else
                {
                    //main reason is room capacity is full
                    //and another is blocked user | already meeting start | password wrong | etc...
                    await SendMessageToCaller(
                        Protocol.BGtoUser.ERROR, 
                        "error occurred while joining room");
                }
            }
            else
            {
                await SendMessageToCaller(
                    Protocol.BGtoUser.ERROR, 
                    "room doesn't exist");
            }  
        }

        public async Task LeaveRoom()
        {
            var clientID = Context.ConnectionId;
            LiveMeeting room = roomMgr.getClientRoom(Context.ConnectionId);
            if (room != null)
            {   
                roomMgr.LeaveClient(Context.ConnectionId);
                await RemoveCallerFromGroup(room.Id.ToString());

                await SendMessageToCaller(
                    Protocol.BGtoUser.ROOM_LEFT,
                    clientID);

                await RoomBroadcast(room.Id, 
                    Protocol.BGtoUser.ROOM_LEFT,
                    clientID);
            }
        }

        public async Task RoomUserList(Int64 roomId)
        {
            LiveMeeting room = roomMgr.getRoomById(roomId);
            if (room == null) return;

            await RoomBroadcast(
                roomId, 
                "roomUserList", 
                JsonConvert.SerializeObject(room.Clients.Select(c=> c.getInfo())));
        }

        public async Task SignalingMessage(string sourceId, string destId, string msg)
        {
            //just relay
            if (destId == "room")
            {
                LiveMeeting room = roomMgr.getClientRoom(Context.ConnectionId);
                if (room != null)
                    await RoomBroadcast(room.Id, "SignalingMessage", msg);
            }
            else
            {
                await SendMessage("SignalingMessage", sourceId, destId, msg);
            }
        }

        public async Task ControlBroadcastMessage(string msg)
        {
            LiveMeeting room = roomMgr.getClientRoom(Context.ConnectionId);
            await RoomBroadcast(room.Id, "controlBroadcastMessage", msg);
        }

        public async Task ControlMessage(string destId, string msg)
        {
            LiveMeeting room1 = roomMgr.getClientRoom(Context.ConnectionId);
            LiveMeeting room2 = roomMgr.getClientRoom(destId);
            if (room1.Id != room2.Id) return;

            await SendMessage("controlMessage", Context.ConnectionId, destId, msg);
        }

        //POC
        public async Task GetRoomInfo()
        {
            List<Meeting> roomInfos = roomMgr.GetAllRoomInfo();

            var list = from room in roomInfos
                       select new
                       {
                           RoomId = room.ConferenceId,
                           Name = room.ConferenceName,
                           ConferenceType = room.ConferenceType,
                           Button = 
                                string.Join("", (room.Participants.Select(
                                u => string.Format("<button class='joinButton btn btn--secondary btn--m' id='{0}'>{1}</button>", u.ParticipantId, u.ParticipantName)))) +
                                ((room.ConferenceType == MeetingType.Open) ? "<button class='joinButton btn btn--secondary btn--m'>Anonymous User</button>" : "")

                       };
            var data = JsonConvert.SerializeObject(list);
            await SendMessageToCaller("updateRoom", data);
        }

    }
}
