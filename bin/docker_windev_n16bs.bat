set host_path=%cd%\..\
docker run -it --rm -v %host_path%:/docker_dev -w /docker_dev node:16-bullseye bash