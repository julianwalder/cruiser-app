# Quick Start - Full Local Development

## 🚀 One Command Setup

```bash
cd packages/frontend
npm run dev:local
```

That's it! This will start both servers:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8787

## ✅ What's Working

- ✅ Build process fixed (TypeScript import issues resolved)
- ✅ API server with mock data
- ✅ Frontend with hot reload
- ✅ API proxying configured
- ✅ File upload support
- ✅ All admin endpoints working

## 🔗 Quick Links

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:8787/health
- **API Docs**: http://localhost:8787/api/docs

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev:local` | Start both servers (recommended) |
| `npm run api:dev` | API server only |
| `npm run dev:simple` | Frontend only |
| `npm run build` | Build for production |

## 📝 Next Steps

1. Open http://localhost:3000 in your browser
2. Navigate to the admin section
3. Test the features (services, bases, aircraft, users)
4. Try uploading images

## 🆘 Troubleshooting

If you get port conflicts:
```bash
lsof -ti:3000,8787 | xargs kill -9
npm run dev:local
```

For detailed setup instructions, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) 