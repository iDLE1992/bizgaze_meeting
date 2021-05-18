using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;
using RestSharp;

namespace BizGazeMeeting.Callback
{
    public class PostHelper
    {
        public static void PostJson(string url, object jsonPayload, string authKey="")
        {
            try
            {
                var client = new RestClient(url);
                var request = new RestRequest(Method.POST);
                if (authKey.Length > 0)
                {
                    request.AddHeader("Authorization", authKey);
                }
                request.AddHeader("Content-Type", "application/json");
                request.AddJsonBody(jsonPayload);
                client.Execute(request);
            } catch (Exception e)
            {

            }

        }

        public static void PostJson(string url, object jsonPayload,
            Action<string> success, Action<Exception> error, string authKey="")
        {
            try
            {
                var client = new RestClient(url);
                var request = new RestRequest(Method.POST);
                if (authKey.Length > 0)
                {
                    request.AddHeader("Authorization", authKey);
                }
                request.AddHeader("Content-Type", "application/json");
                request.AddJsonBody(jsonPayload);

                IRestResponse response = client.Execute(request);
                if (response != null && success != null)
                {
                    success(response.Content);
                }
                else if (response == null && error !=null)
                {
                    error(null);
                }
            } catch (Exception e)
            {
                error(e);
            }
        }
    }
}
