createImageFromColor = function createImageFromColor(color) {
    var img = new Image(textureSize, textureSize);
    selCtx.rect(0, 0, textureSize, textureSize);
    selCtx.fillStyle = color;
    selCtx.fill();
    img.src = canvas.toDataURL();
    return img;
}

fillRectangleInContext = function(ctx, x, y, w, h, color) {
    if(color === "#0")
        color = "#000000";
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

drawRectangleBorderInContex = function(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.stroke();
}
