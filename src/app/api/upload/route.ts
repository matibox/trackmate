import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { auth } from '~/server/auth';
import {
  ACCEPTED_TELEMETRY_FILES,
  MAX_TELEMETRY_FILE_SIZE,
} from '~/lib/constants';

export async function POST(request: Request) {
  const session = await auth();

  // Comment those 3 lines to test in postman
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!ACCEPTED_TELEMETRY_FILES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only .zip files are accepted.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_TELEMETRY_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split('.').pop() ?? 'zip';
    const filename = `${nanoid(10)}.${fileExtension}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file.' },
      { status: 500 }
    );
  }
}
