using BizGazeMeeting.Model;
using BizGazeMeeting.Callback.Payload;

namespace BizGazeMeeting.Callback
{
    public class BizGazeCallback
    {
        public static void onMeetingStart(LiveMeeting meeting)
        {
            MeetingStart payload = new MeetingStart();
            payload.ConferenceId = meeting.Id;
            payload.StartTime = meeting.openTime;

            string callbackRoot = meeting.CallbackUrl;
            string url = string.Format(Urls.meetingStartUrl, callbackRoot);

            PostHelper.PostJson(url, payload, Urls.authKey);
        }

        public static void onMeetingEnd(LiveMeeting meeting)
        {
            MeetingEnd payload = new MeetingEnd();
            payload.ConferenceId = meeting.Id;
            payload.StartTime = meeting.openTime;
            payload.StartTime = meeting.closeTime;
            meeting.Clients.ForEach(c =>
            {
                MeetingParticipant p = new MeetingParticipant();
                p.ParticipantId = c.BGId;
                p.Present = c.joined;
                if (c.joined)
                {
                    p.JoinTime = c.joinTime;
                    p.LeaveTime = c.leaveTime;
                }
                payload.Participants.Add(p);
            });

            string callbackRoot = meeting.CallbackUrl;
            string url = string.Format(Urls.meetingEndUrl, callbackRoot);

            PostHelper.PostJson(url, payload, Urls.authKey);
        }

        public static void onMeetingJoined(LiveMeeting meeting, Client user)
        {
            MeetingJoin payload = new MeetingJoin();
            payload.ConferenceId = meeting.Id;
            payload.participantId = user.BGId;
            payload.JoinTime = user.joinTime;

            string callbackRoot = meeting.CallbackUrl;
            string url = string.Format(Urls.meetingJoinUrl, callbackRoot);

            PostHelper.PostJson(url, payload, Urls.authKey);
        }

        public static void onMeetingLeft(LiveMeeting meeting, Client user)
        {
            MeetingLeave payload = new MeetingLeave();
            payload.ConferenceId = meeting.Id;
            payload.participantId = user.BGId;
            payload.LeaveTime = user.leaveTime;

            string callbackRoot = meeting.CallbackUrl;
            string url = string.Format(Urls.meetingLeaveUrl, callbackRoot);

            PostHelper.PostJson(url, payload, Urls.authKey);
        }
    }
}
