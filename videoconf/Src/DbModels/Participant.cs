using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System;

namespace BizGazeMeeting.DbModels
{
    public class Participant
    {
        [BsonElement("ParticipantId")]
        [Required]
        public Int64 ParticipantId { get; set; }

        [BsonElement("ParticipantName")]
        [Required]
        public string ParticipantName { get; set; }

        [BsonElement("Code")]
        public string Code { get; set; }

        [BsonElement("ParticipantType")]
        public string ParticipantType { get; set; }
    }
}
