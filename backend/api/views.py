from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group,User
from .serializers import ServerListSerializer, ThreadSerializer
from django.forms.models import model_to_dict
from django.http.response import JsonResponse
from .models import QueryThread

class GetThreads(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,server):
        threads = QueryThread.objects.filter(room__name=server)
        data = []
        for i in threads:
            data.append(ThreadSerializer(i).data)
        return JsonResponse(data=data,safe=False,status=status.HTTP_200_OK)


class GetServers(APIView):
    permission_classes = [AllowAny]
    serializer_class = ServerListSerializer
    def get(self,request,*args,**kwargs):
        server = Group.objects.all()
        data = []
        for i in server:
            data.append(ServerListSerializer(i).data)
        return JsonResponse(data=data,safe=False,status=status.HTTP_200_OK)   

    
class MyServerList(APIView):
    permission_class = [IsAuthenticated]
    serializer_class = ServerListSerializer
    def get(self,request,*args, **kwargs):
        server = self.request.user.groups.all()
        data = []
        for i in server:
            data.append(ServerListSerializer(i).data)
        return JsonResponse(data=data,safe=False,status=status.HTTP_200_OK)


class CreateServerView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServerListSerializer

    def post(self,request,*args,**kwargs):
        name = self.request.data["name"]
        data = []
        grp = Group.objects.create(name=name)
        self.request.user.groups.add(grp)
        return JsonResponse(data=data,safe=False,status=status.HTTP_200_OK)