using BizGazeMeeting.DbModels;
using BizGazeMeeting.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using System;

/*
 PostData to be send to meet.bizgaze.com from the Bizgaze Apps whenever conference(group call / webinar) created.


{ConferenceId, ConferenceName, StartDateTime, Duration, EndDateTime, 
List<Participant> Participants, ConferenceTypeId, Description, CallbackUrl, RefGuid}

ConferenceId - ReferenceId generated from the Bizgaze App
ConferenceName - Name Given to the Conference
Description - Description
StartDateTime - Start Date with time of Conference
EndDateTime - End Date with time of Conference
Duration - Duration
Participants - List of Participants of the conference
ConferenceTypeId - Open, Closed (Requires authentication or not)
CallbackUrl - URL to be called when the caller subscribes for an event
RefGuid - uniqueId generated for the conference in BizgazeApp



{ParticipantId, ParticipantName, Code, ParticipantType}

ParticipantId   - UserId in Bizgaze
ParticipantName - User Name
Code            - Code Generated for the user for meeting Access (Requires for Closed Conference Only)
ParticipantType - Moderator, Normal


 */


namespace MeetingApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly MeetingService _meetingService;
        private readonly ILogger<MeetingController> _logger;

        public MeetingController(MeetingService meetingService, ILogger<MeetingController> logger)
        {
            _meetingService = meetingService;
            _logger = logger;
        }

        [HttpGet("{id}", Name = "GetMeeting")]
        public ActionResult<Meeting> Get(Int64 id)
        {
            var meeting = _meetingService.Get(id);

            if (meeting == null)
            {
                return NoContent(); //404
            }

            return meeting;
        }

        [HttpPost("create")]
        public IActionResult Create(Meeting meeting)
        {
            _meetingService.Create(meeting);
            return NoContent();
        }

        [HttpPost("update/{id}")]
        public IActionResult Update(Int64 id, Meeting meetingIn)
        {
            var meeting = _meetingService.Get(id);

            if (meeting == null)
            {
                return NotFound();
            }

            _meetingService.Update(id, meetingIn);

            return NoContent();
        }

        [HttpPost("delete/{id}")]
        public IActionResult Delete(Int64 id)
        {
            var meeting = _meetingService.Get(id);

            if (meeting == null)
            {
                return NotFound();
            }

            _meetingService.Remove(meeting.ConferenceId);

            return NoContent();
        }
    }
}
