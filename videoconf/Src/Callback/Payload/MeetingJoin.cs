using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BizGazeMeeting.Callback.Payload
{
    [Serializable]
    public class MeetingJoin
    {
        [JsonProperty("ConferenceId")]
        public Int64 ConferenceId { get; set; }

        [JsonProperty("ParticipantId")]
        public Int64 participantId { get; set; }

        [JsonProperty("JoinTime")]
        public DateTime JoinTime { get; set; }
    }
}
