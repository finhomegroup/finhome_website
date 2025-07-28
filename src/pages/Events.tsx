import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Rocket, Lightbulb, TrendingUp, Users, Flame, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Today');

  const categories = ['All', 'Tech', 'Music', 'Art', 'Business', 'Sports', 'Food'];
  const timeFrames = ['Today', 'This Week', 'This Month', 'Custom Range'];

  const events = [
    {
      id: 1,
      title: 'VLU Mentor Networking Day 2025',
      organizer: 'Van Lang Incubation Center',
      date: '28 July 2025',
      time: '13:30 - 17:00',
      location: 'Building J - Van Lang University',
      description: 'An event connecting mentors, businesses, and student startups to promote the innovation ecosystem at Van Lang through project showcases, sharing sessions, and strategic partnership signings.',
      tags: ['Startup', 'Pitch', 'Investment'],
      icon: Rocket,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      tagBg: 'bg-blue-100',
      tagColor: 'text-blue-700'
    },
    {
      id: 2,
      title: 'Innovation Hackathon 2025',
      organizer: 'Saigon Innovation Hub',
      date: '15 Jun 2025',
      time: '48 Hours',
      location: 'Saigon Hi-Tech Park',
      description: '48-hour non-stop hackathon for aspiring entrepreneurs. Build your MVP from scratch with mentorship from successful founders.',
      tags: ['Hackathon', 'Innovation', 'MVP'],
      icon: Lightbulb,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      tagBg: 'bg-green-100',
      tagColor: 'text-green-700'
    },
    {
      id: 3,
      title: 'Startup Funding Bootcamp',
      organizer: 'Tech Angels Vietnam',
      date: '10 May 2025',
      time: '09:00 - 16:00',
      location: 'Hub@Innovation',
      description: 'Learn how to secure funding for your startup from leading VCs and angel investors. Master the art of pitching and valuation.',
      tags: ['Funding', 'Investors', 'Workshop'],
      icon: TrendingUp,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      tagBg: 'bg-amber-100',
      tagColor: 'text-amber-700'
    },
    {
      id: 4,
      title: 'Founders Meetup & Networking',
      organizer: 'Vietnam Founders Network',
      date: '25 April 2025',
      time: '18:30 - 21:00',
      location: 'Dreamplex Coworking Space',
      description: 'Monthly gathering of startup founders, co-founders, and aspiring entrepreneurs. Share experiences, find co-founders, and build your network.',
      tags: ['Founders', 'Networking', 'Community'],
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      tagBg: 'bg-purple-100',
      tagColor: 'text-purple-700'
    },
    {
      id: 6,
      title: 'Startup Launchpad 2025',
      organizer: 'Vietnam Startup Network',
      date: '20 Feb 2025',
      time: '13:30 - 17:00',
      location: 'INNOVEX Convention Center',
      description: 'The ultimate startup pitch competition! Connect with VCs, angel investors, and mentors. Top 10 startups will receive funding up to $500K.',
      tags: ['Startup', 'Pitch', 'Investment'],
      icon: Rocket,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      tagBg: 'bg-blue-100',
      tagColor: 'text-blue-700'
    }
  ];

  const trendingEvents = [
    { title: 'Networking Day', date: '28 July 2025', location: 'VLU', icon: Flame, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    { title: 'City Marathon', date: '2 Jun 2025', location: 'Downtown', icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Sustainability Expo', date: '15 Jun 2025', location: 'Green Center', icon: Lightbulb, iconBg: 'bg-green-100', iconColor: 'text-green-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Time Frame</h3>
              <div className="space-y-2">
                {timeFrames.map((timeFrame) => (
                  <button
                    key={timeFrame}
                    onClick={() => setSelectedTimeFrame(timeFrame)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedTimeFrame === timeFrame
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {timeFrame}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-2">Create Event</h3>
              <p className="text-sm opacity-90 mb-4">Share your upcoming events with the community</p>
              <button className="w-full py-2 rounded-lg bg-white text-indigo-600 font-medium hover:bg-opacity-90 transition-colors">
                Create Now
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Latest</option>
                <option>Popular</option>
                <option>Nearest</option>
              </select>
            </div>
          </div>
          
          {/* Event Cards */}
          <div className="space-y-5">
            {events.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full ${event.iconBg} flex items-center justify-center ${event.iconColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-500">Organized by {event.organizer}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                        {event.date}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map((tag) => (
                        <span key={tag} className={`px-3 py-1 ${event.tagBg} ${event.tagColor} rounded-full text-xs font-medium`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-center">
              <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center space-x-2">
                <span>Load More Events</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Trending Events</h3>
              <div className="space-y-4">
                {trendingEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`h-10 w-10 rounded-lg ${event.iconBg} flex items-center justify-center ${event.iconColor} flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.date} • {event.location}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Your Calendar</h3>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <span key={day} className="text-xs text-gray-500">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                  <span
                    key={day}
                    className={`text-xs p-2 ${
                      day === 15 || day === 20
                        ? 'bg-indigo-100 text-indigo-700 rounded-full font-medium'
                        : ''
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <button className="w-full py-2 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors">
                  View Full Calendar
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Event Organizers</h3>
              <div className="space-y-3">
                {[
                  { name: 'TechCorp', initials: 'TC', bg: 'bg-blue-500' },
                  { name: 'SoundWave', initials: 'SW', bg: 'bg-green-500' },
                  { name: 'Global Tastes', initials: 'GT', bg: 'bg-amber-500' }
                ].map((organizer) => (
                  <div key={organizer.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`h-8 w-8 rounded-full ${organizer.bg} flex items-center justify-center text-white text-xs`}>
                        {organizer.initials}
                      </div>
                      <span className="text-sm font-medium">{organizer.name}</span>
                    </div>
                    <button className="text-xs text-indigo-600 font-medium">Follow</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
      
      <Footer />
    </div>
  );
};

export default Events; 