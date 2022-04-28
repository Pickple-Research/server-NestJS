# 실행환경: 우분투 20.04
FROM ubuntu:20.04

# TimeZone: 서울
ENV TZ=Asia/Seoul

# apt-get 업그레이드 && nginx 설치
#RUN apt-get update && apt-get install nginx -y

# nginx 기본 proxy 설정 파일 제거
#RUN rm /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

# (github 레포지토리의) nginx-server 파일을 도커에 복사 후 심볼릭 링크 생성
#COPY nginx-server /etc/nginx/sites-available/
#RUN ln -s /etc/nginx/sites-available/nginx-server /etc/nginx/sites-enabled/nginx-server

# 참고: https://engineerworkshop.com/blog/how-to-install-a-specific-version-of-node-in-ubuntu-linux/
# npm(v16) 설치
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# yarn 설치 && yarn 버전 세팅
RUN npm install -g yarn -y && yarn set version 1.22.18

# pm2 설치 && server 폴더 생성
#RUN npm install -g pm2 -y && mkdir /server

# (github 레포지토리의) 모든 내용을 도커 내의 /server 폴더로 복사
COPY . /server

# WORKDIR를 server로 설정
# (cd 명령어가 개별적으로 실행되기 때문에, cd server && yarn && yarn build 형태로 진행할 수 없음)
WORKDIR /server

# node modules 설치하고 build
RUN yarn install && yarn build

##################################

# 도커 이미지가 호출되었을 때 실행할 프로세스 지정.
# (pm2가 아니라 pm2-runtime을 사용하는 이유는,
# NestJS 서비스를 background가 아니라 foreground에서 동작시켜야하기 때문)
#ENTRYPOINT [ "pm2-runtime", "start", "dist/main.js" ]
ENTRYPOINT ["node", "dist/main.js"]

