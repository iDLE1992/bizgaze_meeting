using System;
using System.Collections.Generic;
using System.Linq;
using BizGazeMeeting.DbModels;

namespace BizGazeMeeting.Model
{
    public class LiveMeeting : IDisposable
    {
        public static int MAX_MEMBER = 10;
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

		public Int64 Id
        {
			get { return _meeting.ConferenceId; }
        }

		public string Subject
        {
			get { return _meeting.ConferenceName; }
        }

		public string CallbackUrl
        {
			get { return _meeting.CallbackUrl; }
        }

		public Client ClientByBGId(Int64 userId)
        {
			return Clients.SingleOrDefault(c => c.BGId == userId);
		}

		public Client ClientByConnId(string connectionId)
		{
			return Clients.SingleOrDefault(c => c.connId == connectionId);
		}

		public IEnumerable<Client> NonHostClients
		{
			get { return Clients.Where(c => c.IsHost == false); }
		}

		public bool IsEmpty()
        {
			return Clients.Count <= 0;
        }

		public Client JoinClient(Int64 userId, string connectionId)
        {
			var client = ClientByBGId(userId);
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

		public void Dispose()
        {

        }

		[Serializable]
		public class MeetingInfo
        {
			public Int64 Id;
			public string subject;
			public long elapsed; //in milliseconds
		};

		public MeetingInfo getInfo()
		{
			return new MeetingInfo() {
				Id = this.Id,
				subject = this.Subject,
				elapsed = (long)DateTime.Now.Subtract(this.openTime).TotalSeconds * 1000
			};
		}
	}
}
