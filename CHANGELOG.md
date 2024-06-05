# [Timetender v0.1.3](https://github.com/Mehver/Timetender/releases/tag/v0.1.3)

### Usage

```shell
# DockerHub
docker pull titanrgb/timetender:v0.1.3
# Ghcr.io
docker pull ghcr.io/mehver/timetender:v0.1.3
# Quay.io
docker pull quay.io/titanrgb/timetender:v0.1.3
```

```shell
docker run -d \
  --name=timetender \
  -e TZ=Asia/Shanghai \
  -p 127.0.0.1:80:8080/tcp \
  -v /path/to/config:/usr/lib/timetender/config \
  -v /path/for/data:/usr/lib/timetender/data \
  titanrgb/timetender
```

### Changelog

* Bump tough-cookie from 4.1.2 to 4.1.3 by @dependabot in https://github.com/Mehver/Timetender/pull/14
* Bump word-wrap from 1.2.3 to 1.2.4 by @dependabot in https://github.com/Mehver/Timetender/pull/15
* Bump @babel/traverse from 7.20.1 to 7.23.2 by @dependabot in https://github.com/Mehver/Timetender/pull/16
* Bump follow-redirects from 1.15.2 to 1.15.4 by @dependabot in https://github.com/Mehver/Timetender/pull/17
* Bump follow-redirects from 1.15.4 to 1.15.6 by @dependabot in https://github.com/Mehver/Timetender/pull/18

**Full Changelog**: https://github.com/Mehver/Timetender/compare/v0.1.2...v0.1.3

# [Timetender v0.1.2](https://github.com/Mehver/Timetender/releases/tag/v0.1.2)

### Usage

```shell
# DockerHub
docker pull titanrgb/timetender:v0.1.2
# Quay.io
docker pull quay.io/titanrgb/timetender:v0.1.2
```

```shell
docker run -d \
  --name=timetender \
  -e TZ=Asia/Shanghai \
  -p 127.0.0.1:80:8080/tcp \
  -v /path/to/config:/usr/lib/timetender/config \
  -v /path/for/data:/usr/lib/timetender/data \
  titanrgb/timetender
```

### Changelog
**Full Changelog**: https://github.com/TitanRGB/Timetender/compare/v0.1.1...v0.1.2

# [Timetender v0.1.1](https://github.com/Mehver/Timetender/releases/tag/v0.1.1)

### Usage

```shell
# DockerHub
docker pull titanrgb/timetender:v0.1.1
```

```shell
docker run -d \
  --name=timetender \
  -e TZ=Asia/Shanghai \
  -p 127.0.0.1:80:8080/tcp \
  -v /path/to/config:/usr/lib/timetender/config \
  -v /path/for/data:/usr/lib/timetender/data \
  titanrgb/timetender
```

### Changelog
**Full Changelog**: https://github.com/TitanRGB/Timetender/compare/v0.1.0...v0.1.1

# [Timetender v0.1.0](https://github.com/Mehver/Timetender/releases/tag/v0.1.0)

### Usage

```shell
# DockerHub
docker pull titanrgb/timetender:v0.1.0
# Quay.io
docker pull quay.io/titanrgb/timetender:v0.1.0
```

```shell
docker run -d -p 80:8080 titanrgb/timetender
```

### Changelog
**Full Changelog**: https://github.com/TitanRGB/Timetender/commits/v0.1.0