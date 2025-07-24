![图片描述](./img_resource/Pasted image 20250506120107.png)
拉取nginx镜像
~~~
docker pull nginx
~~~

查看docker目前有哪些镜像
~~~
docker images
~~~
把一个镜像导出tar压缩文件
~~~
docker save -o nginxfromdocker.tar nginx:latest

~~~
删除一个镜像
~~~
docker rmi nginx:latest 

~~~
加载tar包的镜像
~~~
docker load -i nginxfromdocker.tar
~~~
![图片描述](./img_resource/Pasted image 20250506122845.png)

创建一个容器
![图片描述](./img_resource/Pasted image 20250506123325.png)

查看有哪些容器
~~~
docker ps
~~~

查看某个容器的日志
~~~
docker logs mynginx
~~~
![图片描述](./img_resource/Pasted image 20250506131514.png)
