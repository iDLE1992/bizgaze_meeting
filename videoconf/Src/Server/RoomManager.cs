using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using BizGazeMeeting.Model;
using BizGazeMeeting.DbModels;
using BizGazeMeeting.Services;
using BizGazeMeeting.Callback;

namespace BizGazeMeeting.Server
{
    public class RoomManager
    {
        private ConcurrentDictionary<Int64, LiveMeeting> liveRoomList; //room id -> room
        private ConcurrentDictionary<string, LiveMeeting> connSessionMap; //connectionId->room
        private MeetingService _meetingService;
        private LogService _logService;

        public RoomManager()
        {
            liveRoomList = new ConcurrentDictionary<Int64, LiveMeeting>();
            connSessionMap = new ConcurrentDictionary<string, LiveMeeting>();
        }


        /*************************************************************************
         * 
         *              Dependency Injection Functions
         *              
         *************************************************************************/
        public void setMeetingService(MeetingService meetingService)
        {
            _meetingService = meetingService;
        }
        public void setLogService(LogService logService)
        {
            _logService = logService;
        }


        /*************************************************************************
         * 
         *              Meeting Logic Functions
         *              
         *************************************************************************/
        public LiveMeeting CreateRoom(Int64 roomId)
        {
            //if room is already on-going
            if (liveRoomList.TryGetValue(roomId, out LiveMeeting room) && room != null)
            {
                return room;
            }

            //check if exist in database
            Meeting meeting = _meetingService.Get(roomId);
            if (meeting == null) return null;

            //if exist, open meeting
            LiveMeeting liveMeeting = new LiveMeeting(meeting);
            if (liveRoomList.TryAdd(liveMeeting.Id, liveMeeting))
            {
                //send via callback
                BizGazeCallback.onMeetingStart(liveMeeting);

                //log to database
                _logService.StartMeeting(meeting);
                return liveMeeting;
            }
            else
            {
                return null;
            }
        }

        private void _FinishRoom(Int64 roomId)
        {
            LiveMeeting room = null;
            if (!liveRoomList.TryGetValue(roomId, out room))
                return;

            //set finish time
            room.closeTime = DateTime.Now;            
            room.Clients.ForEach(c =>
            {
                if (c.leaveTime == default(DateTime)) c.leaveTime = room.closeTime;
            });

            //send via callback
            BizGazeCallback.onMeetingEnd(room);

            //log to database
            _logService.FinishMeeting(room._meeting);

            room.Clients.ForEach(c => connSessionMap.TryRemove(c.connId, out _));
            room.Clients.Clear();
            room.Dispose();

            liveRoomList.TryRemove(roomId, out _);
        }

        /**
         * **************************************************************************
         *              
         *              Join GroupChattig | webinar
         *           in webinar  [ userId = 0 ] means Anonymous user
         *
         * **************************************************************************
         */
        public Client JoinClientToRoom(Int64 roomId, Int64 userId, string anonymousUserName, string connectionId)
        {
            LiveMeeting room = getRoomById(roomId);
            if (room == null)
                return null;

            var client = room.JoinClient(userId, anonymousUserName, connectionId);
            if (client == null)
            {
                return null;
            }

            connSessionMap[connectionId] = room;

            //send via callback
            BizGazeCallback.onMeetingJoined(room, client);

            //log to database
            _logService.JoinMeeting(room._meeting, client.participant);
            return client;
        }

        public bool LeaveClient(string connectionId)
        {
            LiveMeeting room = getClientRoom(connectionId);
            if (room == null) return false;


            var client = room.LeaveClient(connectionId);
            if (client == null) return false;

            connSessionMap.TryRemove(connectionId, out _);

            //send via callback
            BizGazeCallback.onMeetingLeft(room, client);

            //log to database
            _logService.LeftMeeting(room._meeting, client.participant);

            return true;
        }


        /*************************************************************************
         * 
         *              Access Helper Functions
         *              
         *************************************************************************/
        public LiveMeeting getRoomById(Int64 roomId)
        {
            if (liveRoomList.TryGetValue(roomId, out LiveMeeting room))
                return room;

            return null;
        }

        public LiveMeeting getClientRoom(string connectionId)
        {
            if (connSessionMap.TryGetValue(connectionId, out LiveMeeting room))
                return room;
            return null;
        }


        /*************************************************************************
         * 
         *              PoC functions for meeting list
         *              
         *************************************************************************/
        private List<Meeting> meetingListForPOC = new List<Meeting>();
        public List<Meeting> GetAllRoomInfo()
        {
            //if (meetingListForPOC.Count <= 0)
            {
                meetingListForPOC = _meetingService.Get();
            }

            return meetingListForPOC;
        }
    }
}
