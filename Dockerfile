# 실행환경: 우분투 20.04
FROM ubuntu:20.04

ENV TZ=Asia/Seoul

# apt-get 업그레이드 && nginx 설치
RUN apt-get update && apt-get install nginx -y

# nginx 기본 proxy 설정 파일 제거
RUN rm /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

# nginx-server 파일을 도커 이미지로 복사 후 심볼릭 링크 생성
COPY nginx-server /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/nginx-server /etc/nginx/sites-enabled/nginx-server

# 참고: https://stackoverflow.com/questions/25899912/how-to-install-nvm-in-docker/60137919#60137919
# nvm 설치 && nvm을 이용하여 node 설치 (nvm 설치시 추가 세팅 필요)
# SHELL ["/bin/bash", "--login", "-i", "-c"]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# RUN source /root/.bashrc && nvm install 16.13.1
# SHELL ["/bin/bash", "--login", "-c"]
RUN /root/.nvm/nvm.sh && nvm install 16.13.1

# yarn 설치 && yarn 버전 세팅
RUN npm install -g yarn -y && yarn set version 1.22.18

# pm2 설치 && server 폴더 생성
RUN npm install -g pm2 -y && mkdir /server

# (github action) github 레포지토리의 모든 내용을 server 폴더로 복사
COPY . /server

RUN yarn build

