#!/bin/bash

sudo apt-get update
sudo apt-get upgrade -y

# install pakages
sudo apt install -y build-essential
g++ --version
gcc --version

sudo apt install -y cmake
cmake --version

# for hw1-7
sudo apt install libeigen3-dev -y
sudo apt install libopencv-dev -y

# for hw8
sudo apt install -y libglu1-mesa-dev freeglut3-dev mesa-common-dev

sudo apt install xorg-dev -y

# setup git
cd ~/.ssh/ || exit

ssh-keygen -t rsa -b 4096 -f ~/.ssh/github -q -N ""

sudo chmod 700 ~/.ssh
sudo chmod 600 ~/.ssh/github

echo -e "Host github.com\n    User git\n    IdentityFile ~/.ssh/github\n    IdentitiesOnly yes" | tee ~/.ssh/config
sudo chmod 600 ~/.ssh/config

# do it manually after pasting the public key to github
# cat ~/.ssh/github.pub
# ssh -i ~/.ssh/github -T git@github.com
# git clone git@github.com:WUY97/GAMES101.git

# export LIBGL_ALWAYS_INDIRECT=1

# https://www.xquartz.org/FAQs.html