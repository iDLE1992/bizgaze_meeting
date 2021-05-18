using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BizGazeMeeting.DbModels
{
    public class MeetingDatabaseSettings : IMeetingDatabaseSettings
    {
        public string MeetingCollectionName { get; set; }
        public string MeetingLogCollectionName { get; set; }
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
    }

    public interface IMeetingDatabaseSettings
    {
        string MeetingCollectionName { get; set; }
        string MeetingLogCollectionName { get; set; }
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}
