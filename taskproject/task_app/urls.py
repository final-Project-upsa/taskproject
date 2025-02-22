from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from . import views 
from rest_framework_simplejwt.views import TokenRefreshView
from .viewfunctions import profileviews, departmentviews, taskviews, dashboardviews, chatviews

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

chat_router = DefaultRouter()
chat_router.register(r'chats', chatviews.ChatViewSet, basename='chat')
chat_router.register(r'chats/(?P<chat_id>\d+)/messages', chatviews.MessageViewSet, basename='message')

urlpatterns = [
    #===========================AUTH & ORG_USER-CREATION=========================================================
    path('', include(router.urls)),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_organization, name='register_organization'),
    path('employees/invite/', views.invite_employee, name='invite-employee'),
    path('employees/register/<str:token>/', views.register_employee, name='register-employee'),
    path('employees/verify-invitation/<str:token>/', views.get_invitation_details, name='invitation_details'),
    path('auth/login/', views.user_login, name='user-login'),
    path('check-subdomain/<str:subdomain>/', views.check_subdomain_availability, name='check-subdomain'),
    #============================================================================================================
    
    #=================================DEBUG======================================================================
    path('debug/check/', views.debug_check, name='debug-check'),
    path('debug/organization/', views.debug_organization, name='debug_organization'),
    #============================================================================================================
    
    #============================PROFILE MANAGER=================================================================
    path('profile/', profileviews.manage_profile, name='manage-profile'),
    path('profile/change-password/', profileviews.change_password, name='change-password'),
    path('current-user/', profileviews.current_user, name='current_user'),
    path('notifications/', profileviews.NotificationListView.as_view(), name='notifications'),
    #=============================================================================================================
    
    #==============================DEPARTMENTS MANAGER============================================================
    path('departments/', departmentviews.list_departments, name='list-departments'),
    path('departments/create/', departmentviews.create_department, name='create-department'),
    path('departments/<int:department_id>/', departmentviews.manage_department, name='manage-department'),
    path('departments/transfer/', departmentviews.transfer_employee, name='transfer-employee'),
    path('organization/department/<int:department_id>/members/', departmentviews.get_department_members, name='department-members'),
    #=============================================================================================================
    
    #==============================TASKS MANAGER==================================================================
    path('tasks/', taskviews.task_list, name='task-list'),
    path('tasks/create/', taskviews.task_create, name='task-create'),
    path('tasks/<int:pk>/', taskviews.task_detail, name='task-detail'),
    path('tasks/<int:task_id>/comments/', taskviews.add_task_comment, name='task-comment'),
    path('tasks/<int:task_id>/attachments/', taskviews.add_task_attachment, name='task-attachment'),
    path('tasks/bulk-update/', taskviews.bulk_update_tasks, name='task-bulk-update'),
    path('tasks/analytics/', taskviews.task_analytics, name='task-analytics'),
    path('tasks/<int:task_id>/assign/', taskviews.assign_task, name='assign-task'), 
    path('tasks/attachments/<int:attachment_id>/download/', taskviews.download_task_attachment, name='download-task-attachment'),
    path('tasks/attachments/<int:attachment_id>/download-url/', taskviews.generate_signed_download_url, name='download-attachment'),
    path('team-activity/', taskviews.TeamActivityListView.as_view(), name='team-activity'),
    #=============================================================================================================

    #==============================Dashboard==================================================================
    path('organization/team/', dashboardviews.OrganizationTeamView.as_view(), name='organization-team'),
    path('user/dashboard/', dashboardviews.user_dashboard, name='user-dashboard'),
    #============================================================================================================
    
    
    #=================================Chat==============================================================
    path('', include(chat_router.urls)),
    path('chats/<int:pk>/mark-read/', chatviews.ChatViewSet.as_view({'post': 'mark_read'}), name='chat-mark-read'),
]