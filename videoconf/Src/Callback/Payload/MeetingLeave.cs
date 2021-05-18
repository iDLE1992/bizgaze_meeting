using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BizGazeMeeting.Callback.Payload
{
    [Serializable]
    public class MeetingLeave
    {
        [JsonProperty("ConferenceId")]
        public Int64 ConferenceId { get; set; }

        [JsonProperty("ParticipantId")]
        public Int64 participantId { get; set; }

        [JsonProperty("LeaveTime")]
        public DateTime LeaveTime { get; set; }
    }
}
