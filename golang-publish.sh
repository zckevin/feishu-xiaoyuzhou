cd golang/
GOOS=linux GOARCH=arm64 go build
ssh aml 'source ~/.zshrc && pm2 stop 0'
scp ./feishu-xiaoyuzhou aml:/root/feishu-xiaoyuzhou/
ssh aml 'source ~/.zshrc && pm2 restart 0'
rm -f ./feishu-xiaoyuzhou
cd ..