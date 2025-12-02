import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  LayoutGrid, 
  TrendingUp, 
  FileText, 
  Activity, 
  Tag, 
  Calendar as CalendarIcon, 
  Download, 
  Plug,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Video,
  MapPin
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CalendarPageProps {
  onSignOut?: () => void;
}

// Mock sessions data
const mockSessions = [
  {
    id: "1",
    title: "Usability Test - P-0042",
    project: "Q2:2026 Usability Testing",
    date: "2024-03-18",
    time: "10:00 AM",
    duration: "45 min",
    type: "moderated",
    participant: "P-0042",
    status: "scheduled"
  },
  {
    id: "2",
    title: "Onboarding Interview",
    project: "Onboarding Study",
    date: "2024-03-18",
    time: "2:00 PM",
    duration: "60 min",
    type: "moderated",
    participant: "P-0043",
    status: "scheduled"
  },
  {
    id: "3",
    title: "Mobile App Feedback",
    project: "Mobile App Beta",
    date: "2024-03-19",
    time: "11:00 AM",
    duration: "30 min",
    type: "moderated",
    participant: "P-0044",
    status: "scheduled"
  },
  {
    id: "4",
    title: "Accessibility Review",
    project: "Accessibility Audit",
    date: "2024-03-20",
    time: "3:00 PM",
    duration: "45 min",
    type: "moderated",
    participant: "P-0045",
    status: "scheduled"
  },
  {
    id: "5",
    title: "Checkout Flow Test",
    project: "Q2:2026 Usability Testing",
    date: "2024-03-21",
    time: "9:00 AM",
    duration: "30 min",
    type: "unmoderated",
    participant: "P-0046",
    status: "scheduled"
  },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarPage({ onSignOut }: CalendarPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)); // March 2024
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const navItems = [
    { id: "projects", label: "Projects", icon: LayoutGrid },
    { id: "trends", label: "Trend Analysis", icon: TrendingUp },
    { id: "divider-1", label: "", icon: () => null, isDivider: true },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "divider-2", label: "", icon: () => null, isDivider: true },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "divider-3", label: "", icon: () => null, isDivider: true },
    { id: "import-export", label: "Import/Export", icon: Download },
    { id: "integrations", label: "Integrations", icon: Plug },
  ];

  const handleNavItemClick = (id: string) => {
    if (id.startsWith("divider")) return;
    if (id === "projects") {
      navigate("/app");
    } else {
      navigate(`/app/${id}`);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: `${year}-${String(month).padStart(2, '0')}-${String(prevMonthLastDay - i).padStart(2, '0')}`
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }
    
    return days;
  };

  const getSessionsForDate = (date: string) => {
    return mockSessions.filter(session => session.date === date);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().toISOString().split('T')[0];

  const upcomingSessions = mockSessions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="calendar"
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user || undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12 lg:mt-0 mb-8">
            <div>
              <h1 className="text-3xl text-slate-900 mb-2">Calendar</h1>
              <p className="text-slate-600">Schedule and manage research sessions</p>
            </div>
            <Button className="gap-2 sm:shrink-0">
              <Plus className="w-4 h-4" />
              Schedule Session
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={view === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("month")}
                      >
                        Month
                      </Button>
                      <Button
                        variant={view === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("week")}
                      >
                        Week
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
                    {/* Day headers */}
                    {daysOfWeek.map(day => (
                      <div key={day} className="bg-slate-50 py-2 text-center text-sm font-medium text-slate-600">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((dayInfo, index) => {
                      const sessions = getSessionsForDate(dayInfo.date);
                      const isToday = dayInfo.date === today;
                      const isSelected = dayInfo.date === selectedDate;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(dayInfo.date)}
                          className={`
                            min-h-[100px] bg-white p-2 cursor-pointer transition-colors
                            ${!dayInfo.isCurrentMonth ? 'bg-slate-50' : ''}
                            ${isSelected ? 'ring-2 ring-indigo-500 ring-inset' : ''}
                            hover:bg-slate-50
                          `}
                        >
                          <div className={`
                            w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1
                            ${isToday ? 'bg-indigo-600 text-white' : ''}
                            ${!dayInfo.isCurrentMonth ? 'text-slate-400' : 'text-slate-900'}
                          `}>
                            {dayInfo.day}
                          </div>
                          <div className="space-y-1">
                            {sessions.slice(0, 2).map(session => (
                              <div
                                key={session.id}
                                className={`
                                  text-xs px-1.5 py-0.5 rounded truncate
                                  ${session.type === 'moderated' 
                                    ? 'bg-indigo-100 text-indigo-700' 
                                    : 'bg-green-100 text-green-700'
                                  }
                                `}
                              >
                                {session.time} {session.participant}
                              </div>
                            ))}
                            {sessions.length > 2 && (
                              <div className="text-xs text-slate-500 px-1">
                                +{sessions.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200"></div>
                      <span className="text-slate-600">Moderated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                      <span className="text-slate-600">Unmoderated</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                  <CardDescription>Next 5 scheduled sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map(session => (
                      <div
                        key={session.id}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-slate-900 text-sm">{session.title}</h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {session.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{session.project}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {session.participant}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">This Week</span>
                      <span className="font-medium">3 sessions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">This Month</span>
                      <span className="font-medium">12 sessions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Completed</span>
                      <span className="font-medium text-green-600">8 sessions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">No-shows</span>
                      <span className="font-medium text-red-600">1 session</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}