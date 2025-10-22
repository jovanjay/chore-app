# S3 Photo Upload Guide

## Overview

The Chore App uses **AWS S3** for storing chore completion photos uploaded by kids. This provides scalable, reliable, and cost-effective cloud storage for images.

## Features

- ✅ Automatic upload to S3
- ✅ Unique filename generation (UUID-based)
- ✅ File type validation (JPEG, PNG, WebP, HEIC)
- ✅ File size validation (max 10MB)
- ✅ Automatic old photo deletion
- ✅ Public URL generation
- ✅ Organized folder structure

## Prerequisites

### 1. AWS Account

You need an AWS account with S3 access:
- Create account at: https://aws.amazon.com
- Access AWS Console: https://console.aws.amazon.com

### 2. S3 Bucket

Create an S3 bucket for storing photos:

1. Go to **S3 Console**: https://s3.console.aws.amazon.com
2. Click **Create bucket**
3. Configure:
   - **Bucket name**: Choose a unique name (e.g., `chore-app-photos-yourname`)
   - **Region**: Choose closest region (e.g., `us-east-1`)
   - **Object Ownership**: ACLs enabled
   - **Block Public Access**: Uncheck "Block all public access"
   - ⚠️ Acknowledge that objects will be public
4. Click **Create bucket**

### 3. Bucket Policy (Public Read Access)

Add a bucket policy to allow public read access to uploaded photos:

1. Go to your bucket
2. Click **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit** and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

### 4. IAM User & Access Keys

Create an IAM user with S3 permissions:

1. Go to **IAM Console**: https://console.aws.amazon.com/iam
2. Click **Users** → **Create user**
3. User name: `chore-app-s3-user`
4. Click **Next**
5. Select **Attach policies directly**
6. Search and select: `AmazonS3FullAccess` (or create custom policy)
7. Click **Next** → **Create user**

**Generate Access Keys:**

1. Click on the newly created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select: **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **Important:** Copy both:
   - Access key ID
   - Secret access key
   - ⚠️ Save these securely! You won't see the secret again.

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# AWS S3 Configuration
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Values:**
- `AWS_S3_REGION`: Your bucket's region (e.g., `us-east-1`, `us-west-2`)
- `AWS_S3_BUCKET`: Your bucket name (exactly as created)
- `AWS_ACCESS_KEY_ID`: From IAM user creation
- `AWS_SECRET_ACCESS_KEY`: From IAM user creation

### Docker Environment

If using Docker, add to `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - AWS_S3_REGION=${AWS_S3_REGION}
      - AWS_S3_BUCKET=${AWS_S3_BUCKET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
```

Then create a `.env` file in the same directory.

## API Usage

### Upload Photo Endpoint

**Endpoint:** `PUT /chores/:id/photo`

**Method:** `PUT`

**Authentication:** JWT (Kid only)

**Content-Type:** `multipart/form-data`

**Parameters:**
- `id` (path): Chore UUID

**Body:**
- `photo` (file): Image file to upload

**Allowed File Types:**
- JPEG/JPG (`image/jpeg`, `image/jpg`)
- PNG (`image/png`)
- WebP (`image/webp`)
- HEIC (`image/heic`)

**File Size Limit:** 10 MB

### Example Requests

#### Using cURL

```bash
curl -X PUT \
  http://localhost:3000/chores/CHORE_ID/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

#### Using Postman

1. **Method:** PUT
2. **URL:** `http://localhost:3000/chores/:id/photo`
3. **Headers:**
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
4. **Body:** 
   - Select **form-data**
   - Key: `photo` (type: File)
   - Value: Select image file

#### Using JavaScript (Fetch API)

```javascript
const uploadPhoto = async (choreId, file, token) => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(
    `http://localhost:3000/chores/${choreId}/photo`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return response.json();
};

// Usage
const fileInput = document.getElementById('photo-input');
const file = fileInput.files[0];
const result = await uploadPhoto('chore-uuid', file, 'jwt-token');
console.log('Uploaded:', result.photo);
```

#### Using React (with Axios)

```javascript
import axios from 'axios';

const uploadChorePhoto = async (choreId, file) => {
  const formData = new FormData();
  formData.append('photo', file);

  const token = localStorage.getItem('token');

  try {
    const response = await axios.put(
      `http://localhost:3000/chores/${choreId}/photo`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('Photo uploaded:', response.data.photo);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response?.data);
    throw error;
  }
};
```

### Response

**Success (200 OK):**

```json
{
  "id": "chore-uuid",
  "title": "Clean bedroom",
  "description": "Make bed and organize desk",
  "points": 50,
  "status": "finished",
  "photo": "https://your-bucket.s3.us-east-1.amazonaws.com/chore-photos/550e8400-e29b-41d4-a716-446655440000.jpg",
  "dateStarted": "2025-10-22T10:00:00.000Z",
  "createdAt": "2025-10-22T08:00:00.000Z",
  "updatedAt": "2025-10-22T10:30:00.000Z",
  "assignedKids": [...]
}
```

**Error Responses:**

**No file provided (400):**
```json
{
  "statusCode": 400,
  "message": "Photo file is required",
  "error": "Bad Request"
}
```

**Invalid file type (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.",
  "error": "Bad Request"
}
```

**File too large (400):**
```json
{
  "statusCode": 400,
  "message": "File size exceeds 10MB limit",
  "error": "Bad Request"
}
```

**S3 not configured (500):**
```json
{
  "statusCode": 500,
  "message": "S3 is not configured. Please set AWS credentials in environment variables.",
  "error": "Internal Server Error"
}
```

## File Organization

Photos are automatically organized in S3:

```
your-bucket/
└── chore-photos/
    ├── 550e8400-e29b-41d4-a716-446655440000.jpg
    ├── 660e8400-e29b-41d4-a716-446655440001.png
    └── 770e8400-e29b-41d4-a716-446655440002.webp
```

**Naming Convention:**
- Folder: `chore-photos/`
- Filename: `{UUID}.{extension}`
- Example: `550e8400-e29b-41d4-a716-446655440000.jpg`

## Behavior

### Upload Flow

1. Kid completes a chore
2. Kid uploads photo proof via API
3. System validates:
   - File type (must be image)
   - File size (max 10MB)
   - User is a kid
   - Kid is assigned to the chore
4. If old photo exists:
   - Delete old photo from S3
5. Generate unique filename
6. Upload to S3 with public-read ACL
7. Save S3 URL to database
8. Return updated chore with photo URL

### Automatic Cleanup

- When a new photo is uploaded for a chore, the old photo is automatically deleted from S3
- This prevents storage buildup and reduces costs

### Public Access

- All uploaded photos are publicly accessible via URL
- No authentication required to view photos
- URLs are permanent unless file is deleted

## Security Considerations

### Best Practices

1. **IAM User Permissions:**
   - Use least-privilege principle
   - Create dedicated IAM user for app
   - Don't use root account credentials

2. **Access Keys:**
   - Never commit `.env` file to Git
   - Rotate access keys regularly
   - Use AWS Secrets Manager in production

3. **Bucket Policy:**
   - Only allow public read, not write
   - Restrict uploads to authenticated API only

4. **Content Validation:**
   - File type validation prevents non-image uploads
   - File size limits prevent abuse
   - Filename randomization prevents conflicts

### Production Recommendations

1. **Use CloudFront CDN:**
   - Faster delivery
   - Reduced S3 costs
   - Better performance globally

2. **Enable Versioning:**
   - Protect against accidental deletion
   - Keep history of changes

3. **Lifecycle Policies:**
   - Archive old photos to Glacier
   - Delete photos after retention period

4. **AWS Secrets Manager:**
   ```typescript
   // Instead of env vars in production
   import { SecretsManager } from '@aws-sdk/client-secrets-manager';
   ```

5. **CloudWatch Monitoring:**
   - Track upload success/failure rates
   - Monitor storage usage
   - Set up cost alerts

## Cost Estimation

### S3 Pricing (us-east-1, approximate)

- **Storage:** $0.023 per GB/month
- **Requests:** $0.005 per 1,000 PUT requests
- **Data Transfer:** $0.09 per GB (first 10TB/month out)

**Example:**
- 1,000 photos/month @ 2MB each = 2 GB storage
- Monthly cost: ~$0.05 + negligible transfer
- **Very affordable!** ✅

### Free Tier

AWS Free Tier (first 12 months):
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB transfer out

## Troubleshooting

### "S3 is not configured"

**Problem:** Environment variables not set

**Solution:**
1. Check `.env` file exists
2. Verify all 4 AWS variables are set
3. Restart application

### "Access Denied" errors

**Problem:** IAM user lacks permissions

**Solution:**
1. Verify IAM policy includes `s3:PutObject`, `s3:DeleteObject`
2. Check bucket policy allows public read
3. Verify bucket name matches exactly

### "Invalid file type"

**Problem:** Uploading non-image file

**Solution:**
- Ensure file is JPEG, PNG, WebP, or HEIC
- Check file extension matches content

### Photos not visible after upload

**Problem:** Bucket policy not set correctly

**Solution:**
1. Verify bucket policy allows `s3:GetObject` for all (`*`)
2. Check "Block Public Access" settings are off
3. Test URL directly in browser

### CORS errors (from browser)

**Problem:** S3 bucket doesn't allow CORS

**Solution:**
Add CORS configuration to bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## Testing

### Test Upload Locally

```bash
# 1. Ensure app is running
docker-compose up -d

# 2. Login and get token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"kid1","password":"password"}' \
  | jq -r '.token')

# 3. Upload photo
curl -X PUT \
  http://localhost:3000/chores/CHORE_ID/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test-photo.jpg"
```

### Verify in AWS Console

1. Go to S3 bucket
2. Navigate to `chore-photos/` folder
3. Find recently uploaded file
4. Click on file
5. Copy **Object URL**
6. Open URL in browser to verify

## Migration from Base64

If you were previously storing base64-encoded images in the database:

### Migration Steps

1. Deploy new version with S3 support
2. Update environment variables
3. Existing photos remain in database (backward compatible)
4. New uploads go to S3
5. Optional: Migrate old photos with script:

```typescript
// migration-script.ts
import { createReadStream } from 'fs';

async function migratePhotos() {
  const chores = await choreRepository.find({ 
    where: { photo: Not(IsNull()) } 
  });

  for (const chore of chores) {
    if (chore.photo.startsWith('data:image')) {
      // Convert base64 to buffer
      const base64Data = chore.photo.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Upload to S3
      const url = await s3Service.uploadFile({
        buffer,
        originalname: `${chore.id}.jpg`,
        mimetype: 'image/jpeg',
      });
      
      chore.photo = url;
      await choreRepository.save(chore);
    }
  }
}
```

## Support

For issues or questions:
- AWS Documentation: https://docs.aws.amazon.com/s3
- AWS SDK for JavaScript: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/

---

**Next Steps:**
1. ✅ Create S3 bucket
2. ✅ Create IAM user
3. ✅ Add credentials to `.env`
4. ✅ Test photo upload
5. ✅ Monitor S3 costs

