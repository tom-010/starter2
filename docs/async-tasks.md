# Async Tasks (Graphile Worker)

Background job processing using [Graphile Worker](https://worker.graphile.org/).

## How it works

- Jobs stored in PostgreSQL (same database)
- Worker polls for jobs and executes tasks
- Tasks defined in `scripts/worker.ts`

## Running the Worker

```bash
npm run worker
```

Run alongside your dev server in a separate terminal.

## Queueing Jobs

Use the helper in `app/lib/jobs.server.ts`:

```ts
import { queueThumbnailJob } from "~/lib/jobs.server";

await queueThumbnailJob({
  attachmentId: 123,
  filepath: "/uploads/image.jpg",
});
```

## Adding New Tasks

1. Define task in `scripts/worker.ts`:

```ts
interface MyPayload {
  someId: number;
}

const myTask: Task = async (payload, helpers) => {
  const { someId } = payload as MyPayload;
  helpers.logger.info(`Processing ${someId}`);
  // do work...
};

const taskList: TaskList = {
  generateThumbnail,
  myTask, // add here
};
```

2. Add queue helper in `app/lib/jobs.server.ts`:

```ts
export async function queueMyTask(payload: MyPayload) {
  await quickAddJob({ connectionString }, "myTask", payload);
}
```

## Existing Tasks

| Task | Description |
|------|-------------|
| `generateThumbnail` | Creates 200x200 thumbnails for uploaded images |
