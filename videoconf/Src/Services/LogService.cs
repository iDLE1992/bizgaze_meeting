using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using BizGazeMeeting.DbModels;

namespace BizGazeMeeting.Services
{
    public class LogService
    {
        private readonly IMongoCollection<MeetingLog> _meetingLogger;

        public LogService(IMeetingDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _meetingLogger = database.GetCollection<MeetingLog>(settings.MeetingLogCollectionName);
        }

        public List<MeetingLog> Get()
        {
            return _meetingLogger.Find<MeetingLog>(log => true).ToList();
        }

        public MeetingLog Get(Int64 id) =>
            _meetingLogger.Find<MeetingLog>(log => log.meeting.ConferenceId == id).FirstOrDefault();

        public MeetingLog Create(MeetingLog meeting)
        {
            _meetingLogger.InsertOne(meeting);
            return meeting;
        }

        //log functions
        public void StartMeeting(Meeting meeting)
        {
            MeetingLog log = new MeetingLog();
            log.LogType = "Start";
            log.meeting = meeting;
            Create(log);
        }

        public void FinishMeeting(Meeting meeting)
        {
            MeetingLog log = new MeetingLog();
            log.LogType = "Finish";
            log.meeting = meeting;
            Create(log);
        }

        public void JoinMeeting(Meeting meeting, Participant user)
        {
            MeetingLog log = new MeetingLog();
            log.LogType = "Join";
            log.meeting = meeting;
            log.participant = user;
            Create(log);
        }

        public void LeftMeeting(Meeting meeting, Participant user)
        {
            MeetingLog log = new MeetingLog();
            log.LogType = "Leave";
            log.meeting = meeting;
            log.participant = user;
            Create(log);
        }
    }
}
