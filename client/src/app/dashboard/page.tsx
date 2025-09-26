"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Trophy, Settings, LogOut, Plus, Bell, CheckSquare, MessageSquare, DollarSign, FileText, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import TaskAssignmentModal from "@/components/TaskAssignmentModal";
import EventCreationModal from "@/components/EventCreationModal";
import SalesManagementModal from "@/components/SalesManagementModal";
import SalesAnalytics from "@/components/SalesAnalytics";
import ProposalSubmissionModal from "@/components/ProposalSubmissionModal";
import ProposalReviewModal from "@/components/ProposalReviewModal";
import UserManagementModal from "@/components/UserManagementModal";
import SystemSettingsModal from "@/components/SystemSettingsModal";
import MessagePortalModal from "@/components/MessagePortalModal";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Dashboard - User data:', parsedUser);
        setUser(parsedUser);
        
        // Load data based on user role
        const [tasksRes, eventsRes, proposalsRes, salesRes, messagesRes] = await Promise.all([
          apiClient.getTasks(),
          apiClient.getEvents({ upcoming: true }),
          apiClient.getProposals(),
          parsedUser.role !== 'member' ? apiClient.getSales() : Promise.resolve({ success: true, sales: [], analytics: {} }),
          apiClient.getMessages()
        ]);
        
        console.log('Dashboard - API responses:', { tasksRes, eventsRes, proposalsRes, salesRes, messagesRes });
        
        if (tasksRes.success) setTasks(tasksRes.tasks || []);
        if (eventsRes.success) setEvents(eventsRes.events || []);
        if (proposalsRes.success) setProposals(proposalsRes.proposals || []);
        if (salesRes.success) setSales(salesRes.sales || []);
        if (messagesRes.success) setMessages(messagesRes.messages || []);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const response = await apiClient.testAuth();
      console.log('Auth test response:', response);
      alert(`Auth test: ${response.success ? 'SUCCESS' : 'FAILED'}\nUser: ${response.user?.name} (${response.user?.role})`);
    } catch (error) {
      console.error('Auth test failed:', error);
      alert(`Auth test FAILED: ${error.message}`);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'lead': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'board': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'member': return <Users className="w-4 h-4" />;
      case 'lead': return <Target className="w-4 h-4" />;
      case 'board': return <Trophy className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              {getRoleIcon(user.role)}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Clubify
              </h1>
              <Badge className={`${getRoleColor(user.role)} text-xs`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={testAuth}>
              Test Auth
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Here&apos;s your {user.role} dashboard overview.
          </p>
        </div>

        {/* Role-specific Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            {user.role !== 'member' && <TabsTrigger value="management">Management</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {tasks.filter(t => t.status === 'pending').length} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Next event soon
                  </p>
                </CardContent>
              </Card>

              {user.role === 'member' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Proposals</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{proposals.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {proposals.filter(p => p.status === 'pending').length} pending review
                    </p>
                  </CardContent>
                </Card>
              )}

              {user.role !== 'member' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${sales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sales.length} transactions
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messages.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {messages.filter(m => !m.isRead).length} unread
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you can perform right now
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {user.role === 'member' && (
                  <>
                    <ProposalSubmissionModal onProposalSubmitted={loadDashboardData} />
                    <MessagePortalModal onMessageSent={loadDashboardData} />
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      // Scroll to events tab
                      const eventsTab = document.querySelector('[value="events"]') as HTMLElement;
                      eventsTab?.click();
                    }}>
                      <Calendar className="w-4 h-4 mr-2" />
                      View Events
                    </Button>
                  </>
                )}
                
                {user.role === 'lead' && (
                  <>
                    <TaskAssignmentModal onTaskCreated={loadDashboardData} />
                    <EventCreationModal onEventCreated={loadDashboardData} />
                    <SalesManagementModal onSaleRecorded={loadDashboardData} />
                  </>
                )}
                
                {user.role === 'board' && (
                  <>
                    <SalesAnalytics onAnalyticsUpdated={loadDashboardData} />
                    <UserManagementModal 
                      manageType="leads"
                      onUsersUpdated={loadDashboardData}
                    >
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Leads
                      </Button>
                    </UserManagementModal>
                    <SystemSettingsModal onSettingsUpdated={loadDashboardData}>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        System Settings
                      </Button>
                    </SystemSettingsModal>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>
                  {user.role === 'member' ? 'Tasks assigned to you' : 'Tasks you have assigned'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tasks found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                                {task.priority}
                              </Badge>
                              <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Events you're involved in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {event.location} • 📅 {new Date(event.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab (for leads and board) */}
          {user.role !== 'member' && (
            <TabsContent value="management" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Member Management for Leads */}
                {user.role === 'lead' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>My Members</CardTitle>
                      <CardDescription>
                        Members you can assign tasks to
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TaskAssignmentModal onTaskCreated={loadDashboardData} />
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          Use the "Assign Task" button above to assign tasks to members.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Proposals Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Proposals to Review</CardTitle>
                    <CardDescription>
                      Member proposals awaiting your review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {proposals.filter(p => p.status === 'pending').length === 0 ? (
                      <div className="text-center py-4">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No pending proposals</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {proposals.filter(p => p.status === 'pending').slice(0, 3).map((proposal) => (
                          <div key={proposal._id} className="border rounded p-3">
                            <h4 className="font-medium text-sm">{proposal.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              by {proposal.proposer?.name}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <ProposalReviewModal 
                                proposal={proposal} 
                                onProposalReviewed={loadDashboardData}
                              >
                                <Button size="sm" variant="outline" className="text-xs">
                                  Review
                                </Button>
                              </ProposalReviewModal>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sales Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                      Latest sales transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sales.length === 0 ? (
                      <div className="text-center py-4">
                        <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No sales recorded</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sales.slice(0, 3).map((sale) => (
                          <div key={sale._id} className="border rounded p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-sm">{sale.product?.name}</h4>
                                <p className="text-xs text-gray-600">
                                  {sale.quantity} × ${sale.unitPrice}
                                </p>
                              </div>
                              <span className="font-semibold text-sm">
                                ${sale.totalAmount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Management Tools */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common management tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.role === 'lead' && (
                      <>
                        <EventCreationModal onEventCreated={loadDashboardData} />
                        <SalesManagementModal onSaleRecorded={loadDashboardData} />
                      </>
                    )}
                    {user.role === 'board' && (
                      <>
                        <SalesAnalytics onAnalyticsUpdated={loadDashboardData} />
                        <UserManagementModal 
                          manageType="all"
                          onUsersUpdated={loadDashboardData}
                        >
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="w-4 h-4 mr-2" />
                            Manage All Users
                          </Button>
                        </UserManagementModal>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Recent system notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">New Event Created</p>
                          <p className="text-xs text-gray-600">A new event has been added to the calendar</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                        <CheckSquare className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Task Completed</p>
                          <p className="text-xs text-gray-600">A member has completed their assigned task</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                        <FileText className="w-4 h-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">New Proposal</p>
                          <p className="text-xs text-gray-600">A member has submitted a new proposal</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}