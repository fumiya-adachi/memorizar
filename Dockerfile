FROM node:20-alpine

WORKDIR /app

# package.jsonを先にコピー（キャッシュ効かせる）
COPY package*.json ./

# 依存関係インストール
RUN npm install

# ソースコピー
COPY . .

# Next.js dev server
EXPOSE 3000

CMD ["npm", "run", "dev"]