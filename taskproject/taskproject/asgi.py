import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path, re_path

# Set the Django settings module before importing consumers
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskproject.settings')
django_asgi_app = get_asgi_application()

# Import consumers after Django settings are configured
from task_app import consumers

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/<str:room_name>/", consumers.ChatConsumer.as_asgi()),
        ])
    ),
})
