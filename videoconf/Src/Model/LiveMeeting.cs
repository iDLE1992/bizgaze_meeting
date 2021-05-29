using System;
using System.Collections.Generic;
using System.Linq;
using BizGazeMeeting.DbModels;

namespace BizGazeMeeting.Model
{
	public class MeetingType
    {
		public readonly static string Open = "Open";
		public readonly static string Closed = "Closed";
    };

	public class MeetingChannelType
    {
		public readonly static string Both = "Both";
		public readonly static string AudioOnly = "AudioOnly";
		public readonly static string VideoOnly = "VideoOnly";
    }

	public class ParticipantType
    {
		public readonly static string Host = "Host";
		public readonly static string Normal = "Normal";
    }

    public class LiveMeeting : IDisposable
    {
        public static int MAX_MEMBER = 75;
        public Meeting _meeting;
        public List<Client> Clients = new List<Client>();
		public DateTime openTime;
		public DateTime closeTime;

        public LiveMeeting(Meeting meeting)
        {
			_meeting = meeting;
			meeting.Participants.ForEach(p =>
			{
				Clients.Add(new Client(p));
			});

			openTime = DateTime.Now;
		}
/**
 * **************************************************************************
 *              
 *              Getter Methods
 *          
 * **************************************************************************
 */
		public Int64 Id
        {
			get { return _meeting.ConferenceId; }
        }

		public string ConferenceName
        {
			get { return _meeting.ConferenceName; }
        }

		public string CallbackUrl
        {
			get { return _meeting.CallbackUrl; }
        }

		public string ConferenceType
		{
			get { return _meeting.ConferenceType; }
		}

		public string ChannelType
        {
			get { return _meeting.ChannelType; }
        }

		/**
		* **************************************************************************
		*              
		*						Join, Leave Methods
		*         in webinar  [ userId = 0 ] means Anonymous user
		*          
		* **************************************************************************
		*/
		public Client JoinClient(Int64 userId, string anonymousUserName, string connectionId)
		{
			Client client = null;

			if (userId == 0)
            {
				if (IsWebinar())
					client = NewAnonymousClient(anonymousUserName);
            } else
            {
				client = ClientByBGId(userId);
			}

			if (client == null || client.joined)
				return null;

			client.connId = connectionId;
			client.joined = true;
			client.joinTime = DateTime.Now;

			return client;
		}

		public Client LeaveClient(string connectionId)
		{
			var client = ClientByConnId(connectionId);
			if (client == null)
				return null;

			client.connId = null;
			client.joined = false;
			client.leaveTime = DateTime.Now;

			return client;
		}

		private Client NewAnonymousClient(string anonymousUserName)
        {
			if (IsFull())
				return null;

			var client = new Client(anonymousUserName);
			Clients.Add(client);
			return client;
        }



		/**
		 * **************************************************************************
		 *              
		 *              Helper Methods
		 *          
		 * **************************************************************************
		 */
		public bool IsEmpty()
        {
            return Clients.Count <= 0;
        }

		public bool IsHostJoined()
        {
			return HostClient != null;
		}

		public bool IsWebinar()
        {
			return ConferenceType == MeetingType.Open;
		}

		public bool IsGroupChatting()
        {
			return ConferenceType == MeetingType.Closed;
        }

		public bool IsAudioOnly()
        {
			return ChannelType == MeetingChannelType.AudioOnly;
        }

		public bool IsVideoOnly()
        {
			return ChannelType == MeetingChannelType.VideoOnly;
        }

        public Client ClientByBGId(Int64 userId)
        {
			return Clients.SingleOrDefault(c => c.BGId == userId);
		}

		public Client ClientByConnId(string connectionId)
		{
			return Clients.SingleOrDefault(c => c.connId == connectionId);
		}

		public Client HostClient
        {
			get { return Clients.FirstOrDefault(c => c.IsHost == true); }
        }

		public bool IsFull()
        {
			return Clients.FindAll(c => c.joined == true).Count >= MAX_MEMBER;
        }

		public void Dispose()
        {

        }

/**
	* **************************************************************************
	*              
	*              User-Concerned Fields 
	*          
	* **************************************************************************
	*/
		[Serializable]
		public class MeetingInfo
        {
			public Int64 Id;
			public bool IsWebinar;
			public string channelType;
			public string conferenceName;
			public string hostName;
			public long elapsed; //in milliseconds
		};

		public MeetingInfo getInfo()
		{
			return new MeetingInfo() {
				Id = this.Id,
				IsWebinar = this.IsWebinar(),
				channelType = this.ChannelType,
				conferenceName = this.ConferenceName,
				hostName = (this.HostClient != null) ? this.HostClient.Name : "",
				elapsed = (long)DateTime.Now.Subtract(this.openTime).TotalSeconds * 1000
			};
		}
	}
}
