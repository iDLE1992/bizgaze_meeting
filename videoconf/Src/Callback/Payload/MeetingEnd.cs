using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BizGazeMeeting.Callback.Payload
{
    [Serializable]
    public class MeetingEnd
    {
        [JsonProperty("ConferenceId")]
        public Int64 ConferenceId { get; set; }

        [JsonProperty("StartTime")]
        public DateTime StartTime { get; set; }

        [JsonProperty("EndTime")]
        public DateTime EndTime { get; set; }

        [JsonProperty("Participants")]
        public List<MeetingParticipant> Participants { get; set; }
    }
}
