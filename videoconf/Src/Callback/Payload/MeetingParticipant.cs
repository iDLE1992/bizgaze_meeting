using System;
using Newtonsoft.Json;

namespace BizGazeMeeting.Callback.Payload
{
    [Serializable]
    public class MeetingParticipant
    {
        [JsonProperty("ParticipantId")]
        public Int64 ParticipantId { get; set; }

        [JsonProperty("Present")]
        public bool Present { get; set; }

        [JsonProperty("JoinTime")]
        public DateTime JoinTime { get; set; }

        [JsonProperty("LeaveTime")]
        public DateTime LeaveTime { get; set; }
    }
}
