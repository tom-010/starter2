from io import BytesIO

from fastapi import FastAPI, File, Query, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

app = FastAPI(title="Image Resize Service")


@app.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Query(..., gt=0, le=4096, description="Target width in pixels"),
    height: int = Query(..., gt=0, le=4096, description="Target height in pixels"),
):
    """Resize an uploaded image to the specified dimensions."""
    contents = await file.read()
    image = Image.open(BytesIO(contents))

    resized = image.resize((width, height), Image.Resampling.LANCZOS)

    output = BytesIO()
    format = image.format or "PNG"
    resized.save(output, format=format)
    output.seek(0)

    media_type = f"image/{format.lower()}"
    return StreamingResponse(output, media_type=media_type)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
