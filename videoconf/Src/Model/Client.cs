using BizGazeMeeting.DbModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace BizGazeMeeting.Model
{
    public class Client
    {
        public string connId;
        public Participant participant;

        public DateTime joinTime;
        public DateTime leaveTime;
        public string IPAddress;

        public bool anonymous = true;
        public string anonymousName;

        public bool joined = false;

        public Client(Participant participant)
        {
            this.participant = participant;
            anonymous = false;
        }

        public Client(string anonymousName)
        {
            this.anonymousName = anonymousName;
            anonymous = true;
        }

        public string Name
        {
            get { return anonymous ? anonymousName : participant.ParticipantName; }
        }

        public bool IsHost
        {
            get { return anonymous ? false : participant.ParticipantType == ParticipantType.Host;}
        }

        public Int64 BGId
        {
            get { return anonymous ? 0 : participant.ParticipantId; }
        }

/**
    * **************************************************************************
    *              
    *              User-Concerned Fields 
    *          
    * **************************************************************************
    */
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
