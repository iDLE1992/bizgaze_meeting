using BizGazeMeeting.DbModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace BizGazeMeeting.Model
{
    public class Client
    {
        public Participant _participant;
        public Client(Participant participant)
        {
            _participant = participant;
        }

        public string connId;
        public bool joined = false;
        public string IPAddress;
        public DateTime joinTime;
        public DateTime leaveTime;

        public string Name
        {
            get
            {
                return _participant.ParticipantName;
            }
        }

        public bool IsHost
        {
            get
            {
                return _participant.ParticipantType == "Moderator";
            }
        }

        public Int64 BGId
        {
            get { return _participant.ParticipantId; }
        }



        [Serializable]
        public class ClientInfo
        {
            public string Id;
            public string Name;
            public bool IsHost;
        }

        public ClientInfo getInfo()
        {
            return new ClientInfo() { Id = this.connId, Name = this.Name, IsHost = this.IsHost };
        }
    }
}
