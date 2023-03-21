using System.Reflection;
using System.Windows;
using BlazorDemo.Masl;
using BlazorDemo.Shared.DownstreamApi;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BlazorDemo.Wpf
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            
            var serviceCollection = new ServiceCollection();
            serviceCollection.AddWpfBlazorWebView();
            serviceCollection.AddScoped<IDownstreamTokenProvider, DownstreamTokenProvider>();
            
#if DEBUG
            serviceCollection.AddBlazorWebViewDeveloperTools();
            //builder.Logging.AddDebug();
#endif
            
            var executingAssembly = Assembly.GetExecutingAssembly();

            using var stream = executingAssembly.GetManifestResourceStream("BlazorDemo.Wpf.appsettings.json");

            var configuration = new ConfigurationBuilder()
                .AddJsonStream(stream)
                .Build();

            serviceCollection.AddSingleton<IExternalAuthService, ExternalAuthService>();
            serviceCollection.AddSingleton<IConfiguration>(configuration);
        
            serviceCollection.AddAuthorizationCore();
            serviceCollection.AddScoped<AuthenticationStateProvider, ExternalAuthStateProvider>();
            serviceCollection.AddSingleton<ExternalAuthService>();
            
            
            Resources.Add("services", serviceCollection.BuildServiceProvider());
        }
    }
}