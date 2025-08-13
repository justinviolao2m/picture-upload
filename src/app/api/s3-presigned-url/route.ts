import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const { fileName, fileType, leadId } = await request.json();

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `${leadId}/${uuidv4()}-${fileName}`,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error generating presigned URL" }, { status: 500 });
  }
}
