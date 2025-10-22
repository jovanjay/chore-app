# S3 Setup - Quick Reference

## 1. Create S3 Bucket

```bash
Bucket Name: chore-app-photos-yourname
Region: us-east-1 (or your preferred region)
Block Public Access: OFF (uncheck all)
```

## 2. Add Bucket Policy

Replace `YOUR-BUCKET-NAME` with your bucket name:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

## 3. Create IAM User

```
User name: chore-app-s3-user
Permissions: AmazonS3FullAccess
Access type: Programmatic access
```

Save the credentials:
- Access Key ID
- Secret Access Key

## 4. Update Environment Variables

Add to your `.env` file:

```env
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=chore-app-photos-yourname
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## 5. Restart Application

```bash
# If using Docker
docker-compose restart

# If running locally
npm run start:dev
```

## 6. Test Upload

```bash
curl -X PUT \
  http://localhost:3000/chores/CHORE_ID/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@test-photo.jpg"
```

## That's it! 🎉

For detailed instructions, see: `S3_PHOTO_UPLOAD_GUIDE.md`

