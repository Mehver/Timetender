set host_path=%cd%\..\
docker run -it --rm -p 8080:8080 -v %host_path%:/docker_dev -w /docker_dev node:16-bullseye bash