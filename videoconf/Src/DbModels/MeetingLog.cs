using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace BizGazeMeeting.DbModels
{
    public class MeetingLog
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("logType")]
        [Required]
        public string LogType { get; set; }

        [BsonElement("Conference")]
        [Required]
        public Meeting meeting { get; set; }

        [BsonElement("Participant")]
        public Participant participant{ get; set; }
    }
}
