# Koyeb Deployment Guide for ID Parser Service

## Service Type: **Web Service** ✅

Use **Web Service** (not Worker) because:

- ID Parser is an HTTP API (FastAPI)
- It needs to accept POST requests from your backend
- Workers are for background jobs, not HTTP services

## Making it Private (Only Accessible from Backend)

### Option 1: Koyeb Private Networking (Recommended)

Koyeb services in the same organization can communicate via private networking.

1. **Deploy ID Parser as Web Service**

   - Go to Koyeb Dashboard → Create App → Web Service
   - Use your production Dockerfile
   - Set port: `8000`

2. **Enable Private Networking**

   - In Koyeb dashboard, go to your ID Parser service
   - Settings → Networking
   - **Disable public HTTP/HTTPS** (make it private)
   - The service will get a private hostname like: `id-parser-<app-name>.koyeb.app`
   - This hostname is only accessible from other Koyeb services

3. **Configure Backend**
   - In your backend service (server), add environment variable:
   ```
   ID_PARSER_URL=http://id-parser-<app-name>.koyeb.app
   ```
   - Koyeb services can resolve each other by service name

### Option 2: Internal Port + Network Restrictions

1. **Deploy without public domain**

   - Don't assign a public domain
   - Service runs on internal port 8000
   - Only accessible via Koyeb's internal network

2. **Use Koyeb Service Discovery**
   - Services can discover each other via DNS
   - Use the internal service name/hostname

### Option 3: API Key Authentication (Additional Security)

Add API key authentication to ID Parser:

```python
# In main.py
import os
from fastapi import Header, HTTPException

API_KEY = os.getenv("API_KEY", "")

@app.post("/parse")
async def parse(
    file: UploadFile = File(...),
    x_api_key: str = Header(None)
):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    # ... rest of code
```

Then in backend, add header:

```typescript
headers: {
  'X-API-Key': process.env.ID_PARSER_API_KEY
}
```

## Deployment Steps

### 1. Build and Push Docker Image

```bash
cd packages/id-parser

# Build production image
docker build -f Dockerfile -t id-parser:prod .

# Tag for your container registry (Docker Hub, GitHub Container Registry, etc.)
docker tag id-parser:prod <your-registry>/id-parser:latest

# Push to registry
docker push <your-registry>/id-parser:latest
```

### 2. Deploy on Koyeb

1. **Create New App**

   - Go to Koyeb Dashboard
   - Click "Create App"
   - Select "Web Service"

2. **Configure Service**

   - **Name**: `id-parser` (or your preferred name)
   - **Docker Image**: `<your-registry>/id-parser:latest`
   - **Port**: `8000`
   - **Region**: Choose closest to your backend

3. **Environment Variables**

   - **Required**: `API_KEY` - API key for authentication (generate a secure random string)
   - Example: `API_KEY=your-secure-random-api-key-here`

4. **Networking**

   - **Public HTTP/HTTPS**: ❌ Disable (make it private)
   - Service will be accessible only via private network

5. **Resources** (Based on VM requirements)

   - **Memory**: 4 GB minimum, 8 GB recommended
   - **CPU**: 2 cores minimum, 4 cores recommended
   - **Disk**: 20 GB minimum

6. **Health Check** (Optional)
   - Path: `/` (FastAPI root endpoint)
   - Interval: 30 seconds

### 3. Configure Backend

In your backend service (server) on Koyeb:

1. **Add Environment Variables** (Both Required)

   ```
   ID_PARSER_URL=http://id-parser-<app-name>.koyeb.app
   ID_PARSER_API_KEY=<same-api-key-as-id-parser-service>
   ```

   Or if using Koyeb service discovery:

   ```
   ID_PARSER_URL=http://id-parser:8000
   ID_PARSER_API_KEY=<same-api-key-as-id-parser-service>
   ```

   **Important**: Use the same `API_KEY` value in both services!

2. **Verify Connection**
   - Backend can now call ID Parser via the private URL
   - No public internet access required

## Testing Private Access

### From Backend (Should Work)

```typescript
// In your backend code
const response = await fetch(env.ID_PARSER_URL + '/parse', {
  method: 'POST',
  body: formData
})
```

### From Public Internet (Should Fail)

```bash
# This should return connection refused/timeout
curl https://id-parser-<app-name>.koyeb.app/parse
```

## Cost Estimate

Based on Koyeb pricing:

- **4 GB RAM, 2 CPU**: ~$40-50/month
- **8 GB RAM, 4 CPU**: ~$80-100/month

## Security Best Practices

1. ✅ **Private Networking**: Service not exposed to public internet
2. ✅ **API Key**: Required authentication header (mandatory)
3. ✅ **Rate Limiting**: Consider adding rate limits in FastAPI
4. ✅ **Input Validation**: Already handled by FastAPI
5. ✅ **Logging**: Monitor access logs in Koyeb dashboard

**Generating a Secure API Key:**

```bash
# Generate a secure random API key
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Monitoring

- Check Koyeb dashboard for:
  - Request logs
  - Error rates
  - Memory/CPU usage
  - Response times

## Troubleshooting

**Backend can't reach ID Parser:**

- Verify `ID_PARSER_URL` is set correctly
- Check both services are in same Koyeb organization
- Verify private networking is enabled
- Check service logs in Koyeb dashboard

**Service not starting:**

- Check Docker image builds successfully
- Verify port 8000 is exposed
- Check resource limits (memory/CPU)
