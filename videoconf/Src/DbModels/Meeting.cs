using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System;

namespace BizGazeMeeting.DbModels
{
    [BsonIgnoreExtraElements]
    public class Meeting
    {
        [BsonElement("ConferenceId")]
        [Required]
        public Int64 ConferenceId { get; set; }

        [BsonElement("ConferenceName")]
        [Required]
        public string ConferenceName { get; set; }

        [BsonElement("Description")]
        public string Description { get; set; }

        [BsonElement("StartDateTime")]
        public DateTime StartDateTime{ get; set; }

        [BsonElement("EndDateTime")]
        public DateTime EndDateTime { get; set; }

        [BsonElement("Duration")]
        public DateTime Duration { get; set; }

        [BsonElement("Participants")]
        public List<Participant> Participants { get; set; }

        [BsonElement("IsControlAllowed")]
        public bool IsControlAllowed { get; set; }

        [BsonElement("IsRecordingRequired")]
        public bool IsRecordingRequired { get; set; }

        [BsonElement("IsMultipleSharingAllowed")]
        public bool IsMultipleSharingAllowed { get; set; }

        [BsonElement("IsScreenShareRequired")]
        public bool IsScreenShareRequired { get; set; }

        [BsonElement("IsOpened")]
        public bool IsOpened { get; set; }

        [BsonElement("ChannelType")]
        public string ChannelType { get; set; }

        [BsonElement("CallbackUrl")]
        public string CallbackUrl { get; set; }

        [BsonElement("RefGuid")]
        public string RefGuid { get; set; }
    }
}
