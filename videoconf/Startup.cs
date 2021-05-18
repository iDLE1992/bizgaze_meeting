using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using BizGazeMeeting.Server;
using BizGazeMeeting.DbModels;
using BizGazeMeeting.Services;


namespace BizGazeMeeting
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // requires using Microsoft.Extensions.Options
            services.Configure<MeetingDatabaseSettings>(
                Configuration.GetSection(nameof(MeetingDatabaseSettings)));

            services.AddSingleton<IMeetingDatabaseSettings>(sp =>
                sp.GetRequiredService<IOptions<MeetingDatabaseSettings>>().Value);

            services.AddSingleton<MeetingService>();
            services.AddSingleton<LogService>();

            services.AddRazorPages().AddRazorPagesOptions(options => {
                options.Conventions.AddPageRoute("/meeting", "");
            });
            services.AddSignalR();

            //test api
            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "BizGazeMeeting", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {   
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage(); 
                //test api
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MeetingApi v1"));

            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
                endpoints.MapControllers();
                endpoints.MapHub<BizGazeMeetingServer>("/BizGazeMeetingServer");
            });

        }
    }
}
