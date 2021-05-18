using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BizGazeMeeting.Server
{
    //BG -> Client
    public class BGC_Msg
    {
        public static string ROOM_CREATED = "created";
        public static string ROOM_INFO = "room_info";
        public static string ROOM_JOINED = "joined";
        public static string ROOM_USER_JOINED = "user_joined";
        public static string ROOM_LEFT = "left";
        public static string ERROR = "error";

        public static string SIGNALING = "SignalingMessage";

    }

    //Client -> BG
    public class CBG_Msg
    {

    }
}
