using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BizGazeMeeting.Callback.Payload
{
    [Serializable]
    public class MeetingStart
    {
        [JsonProperty("ConferenceId")]
        public Int64 ConferenceId { get; set; }

        [JsonProperty("StartTime")]
        public DateTime StartTime { get; set; }
    }
}
