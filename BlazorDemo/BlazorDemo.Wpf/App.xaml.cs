﻿using System;
using System.Runtime.ExceptionServices;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace BlazorDemo.Wpf
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App
    {
        public App()
        {
            DispatcherUnhandledException += OnDispatcherUnhandledException;
            TaskScheduler.UnobservedTaskException += OnTaskSchedulerUnobservedTaskException;
            AppDomain.CurrentDomain.UnhandledException += OnCurrentDomainUnhandledException;
            AppDomain.CurrentDomain.FirstChanceException += OnCurrentDomainUnhandledException;
        }

        // Dispatcher.UnhandledException
        private static void OnDispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
        {
            var a = 1;
        }

        // TaskScheduler.UnobservedTaskException
        private static void OnTaskSchedulerUnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
        {
            var a = 1;
        }

        //  AppDomain.CurrentDomain.UnhandledException    
        private static void OnCurrentDomainUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            var a = 1;
        }

        // AppDomain.CurrentDomain.FirstChanceException
        private static void OnCurrentDomainUnhandledException(object? sender, FirstChanceExceptionEventArgs e)
        {
            var a = 1;
        }
    }
}