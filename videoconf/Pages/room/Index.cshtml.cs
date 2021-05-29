using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace BizGazeMeeting.Pages.meeting
{
    [IgnoreAntiforgeryToken(Order = 1001)]
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public Int64 _meetingId;
        public Int64 _userId;
        public string _anonymousUserName;
        public string _camId;
        public string _micId;
        public string _speakerId;
        public string _videoMute;
        public string _audioMute;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }
        public void OnPost(Int64 meetingId, Int64 userId, string anonymousUserName, 
            string cameraId, string micId, string speakerId,
            string videoMute, string audioMute)
        {
            this._meetingId = meetingId;
            this._userId = userId;
            this._anonymousUserName = anonymousUserName == null ? "" : anonymousUserName.Trim();
            this._camId = cameraId;
            this._micId = micId;
            this._speakerId = speakerId;
            this._videoMute = videoMute;
            this._audioMute = audioMute;

            if (_userId == 0 && _anonymousUserName.Length <= 0)
                Response.Redirect("/", true);
        }
    }
}
