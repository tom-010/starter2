import "dotenv/config";
import { run, type Task, type TaskList } from "graphile-worker";
import sharp from "sharp";
import { join } from "path";
import { mkdir } from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

interface GenerateThumbnailPayload {
  attachmentId: number;
  filepath: string;
}

const generateThumbnail: Task = async (payload, helpers) => {
  const { attachmentId, filepath } = payload as GenerateThumbnailPayload;
  helpers.logger.info(`Generating thumbnail for attachment ${attachmentId}`);

  const uploadsDir = join(process.cwd(), "public", "uploads");
  const thumbsDir = join(process.cwd(), "public", "uploads", "thumbnails");
  await mkdir(thumbsDir, { recursive: true });

  // Extract filename from filepath (e.g., /uploads/123-file.jpg -> 123-file.jpg)
  const filename = filepath.replace("/uploads/", "");
  const inputPath = join(uploadsDir, filename);
  const thumbFilename = `thumb-${filename}`;
  const outputPath = join(thumbsDir, thumbFilename);
  const thumbnailPath = `/uploads/thumbnails/${thumbFilename}`;

  try {
    await sharp(inputPath)
      .resize(200, 200, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    await db.attachment.update({
      where: { id: attachmentId },
      data: { thumbnailPath },
    });

    helpers.logger.info(`Thumbnail generated: ${thumbnailPath}`);
  } catch (error) {
    helpers.logger.error(`Failed to generate thumbnail: ${error}`);
    throw error;
  }
};

const taskList: TaskList = {
  generateThumbnail,
};

async function main() {
  const runner = await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList,
  });

  console.log("Worker started, waiting for jobs...");

  await runner.promise;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
