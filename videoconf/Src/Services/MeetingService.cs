using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using BizGazeMeeting.DbModels;

namespace BizGazeMeeting.Services
{
    public class MeetingService
    {
        private readonly IMongoCollection<Meeting> _meetings;

        public MeetingService(IMeetingDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _meetings = database.GetCollection<Meeting>(settings.MeetingCollectionName);
        }

        public List<Meeting> Get()
        {
            return _meetings.Find<Meeting>(meeting => true).ToList();
        }
            

        public Meeting Get(Int64 id) =>
            _meetings.Find<Meeting>(meeting => meeting.ConferenceId == id).FirstOrDefault();

        public Meeting Create(Meeting meeting)
        {
            _meetings.InsertOne(meeting);
            return meeting;
        }

        public void Update(Int64 id, Meeting meetingIn) =>
            _meetings.ReplaceOne(meeting => meeting.ConferenceId == id, meetingIn);

        public void Remove(Meeting meetingIn) =>
            _meetings.DeleteOne(meeting => meeting.ConferenceId == meetingIn.ConferenceId);

        public void Remove(Int64 id) =>
            _meetings.DeleteOne(meeting => meeting.ConferenceId == id);
    }
}
