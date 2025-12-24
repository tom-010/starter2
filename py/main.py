from io import BytesIO

from fastapi import FastAPI, File, Query, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from logger import log, lifespan





app = FastAPI(title="Image Resize Service", lifespan=lifespan)


@app.get("/hi")
async def hello():
    """Simple endpoint to verify the service is running."""
    log.debug("debug message", number=1)
    log.info("info message", number=2)
    log.warning("warning message", lnumber=3)
    log.error("error message", a=4)
    log.critical("critical message", level="critical", number=5)
    return {"message": "Hello, World!"}


@app.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Query(..., gt=0, le=4096, description="Target width in pixels"),
    height: int = Query(..., gt=0, le=4096, description="Target height in pixels"),
):
    """Resize an uploaded image to the specified dimensions."""
    contents = await file.read()
    image = Image.open(BytesIO(contents))

    log.info(
        "resizing image",
        filename=file.filename,
        original_size=image.size,
        target_size=(width, height),
    )

    resized = image.resize((width, height), Image.Resampling.LANCZOS)

    output = BytesIO()
    format = image.format or "PNG"
    resized.save(output, format=format)
    output.seek(0)

    media_type = f"image/{format.lower()}"
    return StreamingResponse(output, media_type=media_type)


if __name__ == "__main__":
    import uvicorn

    log.info("starting server", host="0.0.0.0", port=8001)
    uvicorn.run(app, host="0.0.0.0", port=8001)
