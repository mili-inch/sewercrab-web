(() => {
    //画像をImageData化
    const createImageData = function (ctx, img, width, height) {
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, width, height);
        return data;
    }
    //上がa,下がb
    //上限下限
    const clamp = function (val, min, max) {
        return val > max ? max : (val < min ? min : val);
    };
    //加算
    const addition = function (pixel_a, pixel_b) {
        return clamp(pixel_a + pixel_b, 0, 255);
    }
    //減算
    const subtraction = function (pixel_a, pixel_b) {
        return clamp(pixel_a - pixel_b, 0, 255);
    }
    //差の絶対値
    const difference = function (pixel_a, pixel_b) {
        return clamp(Math.abs(pixel_a - pixel_b), 0, 255);
    }
    //乗算
    const multiply = function (pixel_a, pixel_b) {
        return clamp(Math.round(pixel_a * pixel_b / 255), 0, 255);
    }
    //除算
    const division = function (pixel_a, pixel_b) {
        return clamp(Math.round(256 * pixel_b / (pixel_a + 1)), 0, 255);
    }
    //ハードライト
    const hardlight = function (pixel_a, pixel_b) {
        return pixel_a > 128 ?
            clamp(Math.round(255 - (255 - 2 * (pixel_a - 128)) * (255 - pixel_b) / 256), 0, 255) :
            clamp(Math.round(2 * pixel_a * pixel_b / 256), 0, 255);
    }
    //合成（α最大）
    const compoundImageData = function (ctx, mode, imageData_a, imageData_b, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] =
                    mode(imageData_a.data[i], imageData_b.data[i]);
                imageData_dst.data[i + 1] =
                    mode(imageData_a.data[i + 1], imageData_b.data[i + 1]);
                imageData_dst.data[i + 2] =
                    mode(imageData_a.data[i + 2], imageData_b.data[i + 2]);
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    };
    //単色出力
    const getPlaneImageData = function (ctx, width, height, r, g, b, a) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] = r;
                imageData_dst.data[i + 1] = g;
                imageData_dst.data[i + 2] = b;
                imageData_dst.data[i + 3] = a;
            }
        }
        return imageData_dst;
    };
    //明度でグレースケール化
    const getGrayImageData = function (ctx, imageData, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                let max = Math.max(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]);
                imageData_dst.data[i] = max;
                imageData_dst.data[i + 1] = max;
                imageData_dst.data[i + 2] = max;
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    };
    //最小値でグレースケール化
    const getGrayImageDataMin = function (ctx, imageData, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                let max = Math.min(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]);
                imageData_dst.data[i] = max;
                imageData_dst.data[i + 1] = max;
                imageData_dst.data[i + 2] = max;
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    };
    //RGBフィルタ
    const getColorFilteredImageData = function (ctx, imageData, rgb, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] = 0 == rgb ? imageData.data[i] : 0;
                imageData_dst.data[i + 1] = 1 == rgb ? imageData.data[i + 1] : 0;
                imageData_dst.data[i + 2] = 2 == rgb ? imageData.data[i + 2] : 0;
                imageData_dst.data[i + 3] = imageData.data[i + 3];
            }
        }
        return imageData_dst;
    };
    //色域選択マスク作成
    const getColorSelectiveMask = function (ctx, imageData, width, height, color = [0, 0, 0], range = 5) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                let col = Math.hypot(
                    imageData.data[i] - color[0],
                    imageData.data[i + 1] - color[1],
                    imageData.data[i + 2] - color[2]
                ) < range ? 255 : 0;
                imageData_dst.data[i] = col;
                imageData_dst.data[i + 1] = col;
                imageData_dst.data[i + 2] = col;
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    }
    //不透明領域でマスク作成
    const getOpacityMask = function (ctx, imageData, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                let col = imageData.data[i + 3] > 0 ? 255 : 0;
                imageData_dst.data[i] = col;
                imageData_dst.data[i + 1] = col;
                imageData_dst.data[i + 2] = col;
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    }
    //選択部分の膨張
    const getExpandedMask = function (ctx, imageData, width, height, degree) {
        let x, y, i;
        let imageData_dst = getPlaneImageData(ctx, width, height, 0, 0, 0, 255);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                if (imageData.data[i] == 255) {
                    for (let dx = -degree; dx < degree + 1; dx++) {
                        for (let dy = -degree; dy < degree + 1; dy++) {
                            let l = (x + dx + (y + dy) * width) * 4;
                            imageData_dst.data[l] = 255;
                            imageData_dst.data[l + 1] = 255;
                            imageData_dst.data[l + 2] = 255;
                        }
                    }
                }
            }
        }
        return imageData_dst;
    };
    //メディアンフィルタ
    const getMedianFilteredImageData = function (ctx, imageData, width, height, range) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                const arr = [];
                for (let dx = -range; dx < range + 1; dx++) {
                    for (let dy = -range; dy < range + 1; dy++) {
                        let l = (x + dx + (y + dy) * width) * 4;
                        arr.push(imageData.data[l]);
                    }
                }
                arr.sort((a, b) => {
                    return a - b;
                });
                const half = Math.floor(arr.length / 2);
                if (arr.length % 2) {
                    imageData_dst.data[i] = arr[half];
                    imageData_dst.data[i + 1] = arr[half];
                    imageData_dst.data[i + 2] = arr[half];
                    imageData_dst.data[i + 3] = 255;
                } else {
                    imageData_dst.data[i] = Math.round((arr[half - 1] + arr[half]) / 2);
                    imageData_dst.data[i + 1] = Math.round((arr[half - 1] + arr[half]) / 2);
                    imageData_dst.data[i + 2] = Math.round((arr[half - 1] + arr[half]) / 2);
                    imageData_dst.data[i + 3] = 255;
                }
            }
        }
        return imageData_dst;
    }
    //反転（α最大）
    const getInversedImageData = function (ctx, imageData, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] =
                    clamp(255 - imageData.data[i], 0, 255);
                imageData_dst.data[i + 1] =
                    clamp(255 - imageData.data[i + 1], 0, 255);
                imageData_dst.data[i + 2] =
                    clamp(255 - imageData.data[i + 2], 0, 255);
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    };
    //マスク適用
    const getMaskedImageData = function (ctx, imageData, mask, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] = imageData.data[i];
                imageData_dst.data[i + 1] = imageData.data[i + 1];
                imageData_dst.data[i + 2] = imageData.data[i + 2];
                imageData_dst.data[i + 3] = mask.data[i];
            }
        }
        return imageData_dst;
    };
    //アルファ移植
    const getAlphaedImageData = function (ctx, imageData, alpha, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] = imageData.data[i];
                imageData_dst.data[i + 1] = imageData.data[i + 1];
                imageData_dst.data[i + 2] = imageData.data[i + 2];
                imageData_dst.data[i + 3] = alpha.data[i + 3];
            }
        }
        return imageData_dst;
    };
    //通常合成（下α最大）
    const compoundImageDataNormal = function (ctx, imageData_a, imageData_b, width, height) {
        let x, y, i;
        let imageData_dst = ctx.createImageData(width, height);
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                i = (x + y * width) * 4;
                imageData_dst.data[i] =
                    clamp(imageData_a.data[i] * imageData_a.data[i + 3] / 255 + imageData_b.data[i] * (255 - imageData_a.data[i + 3]) / 255, 0, 255);
                imageData_dst.data[i + 1] =
                    clamp(imageData_a.data[i + 1] * imageData_a.data[i + 3] / 255 + imageData_b.data[i + 1] * (255 - imageData_a.data[i + 3]) / 255, 0, 255);
                imageData_dst.data[i + 2] =
                    clamp(imageData_a.data[i + 2] * imageData_a.data[i + 3] / 255 + imageData_b.data[i + 2] * (255 - imageData_a.data[i + 3]) / 255, 0, 255);
                imageData_dst.data[i + 3] = 255;
            }
        }
        return imageData_dst;
    };
    //角丸マスク生成
    const getLeagueCardMask = function (ctx, width, height, x, y, w, h, r, color) {
        function drawsq(x, y, w, h, r, color) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.moveTo(x, y + r);
            ctx.arc(x + r, y + h - r, r, Math.PI, Math.PI * 0.5, true);
            ctx.arc(x + w - r, y + h - r, r, Math.PI * 0.5, 0, 1);
            ctx.arc(x + w - r, y + r, r, 0, Math.PI * 1.5, 1);
            ctx.arc(x + r, y + r, r, Math.PI * 1.5, Math.PI, 1);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        drawsq(x, y, w, h, r, color);
        return ctx.getImageData(0, 0, width, height);
    }
    //トリミング
    const getTrimedImageData = function (ctx, imageData, width, height, dx, dy, dw, dh) {
        let x, y, i, j;
        let imageData_dst = ctx.createImageData(dw, dh);
        for (y = dy; y < dy + dh + 1; y++) {
            for (x = dx; x < dx + dw + 1; x++) {
                i = (x + y * width) * 4;
                j = (x - dx + (y - dy) * dw) * 4;
                imageData_dst.data[j] = imageData.data[i];
                imageData_dst.data[j + 1] = imageData.data[i + 1];
                imageData_dst.data[j + 2] = imageData.data[i + 2];
                imageData_dst.data[j + 3] = imageData.data[i + 3];
            }
        }
        return imageData_dst;
    }
    const getCroppedImageData = function (ctx, card_a, card_b, back_a, back_b, width, height, correct = false) {
        const difference_card = compoundImageData(ctx, difference, card_a, card_b, width, height);
        const difference_back = compoundImageData(ctx, difference, back_a, back_b, width, height);
        const division_btoc = compoundImageData(ctx, division, difference_back, difference_card, width, height);
        const alphaMaskCol = getInversedImageData(ctx, division_btoc, width, height);
        const alphaMask = getGrayImageData(ctx, alphaMaskCol, width, height);
        const colorDifferenceMask = getColorSelectiveMask(ctx, difference_card, width, height);
        const expandedDiffMask = getExpandedMask(ctx, colorDifferenceMask, width, height, 2);
        const expandedDiffMaskInv = getInversedImageData(ctx, expandedDiffMask, width, height);
        const alphaexpandedDiffMask = getMaskedImageData(ctx, getPlaneImageData(ctx, width, height, 0, 0, 0, 255), expandedDiffMaskInv, width, height);
        const alphaDiffMask = getMaskedImageData(ctx, getPlaneImageData(ctx, width, height, 255, 255, 255, 255), colorDifferenceMask, width, height);
        const coveredAlphaMask = compoundImageDataNormal(ctx, alphaexpandedDiffMask, alphaMask, width, height);
        let resultMask = compoundImageDataNormal(ctx, alphaDiffMask, coveredAlphaMask, width, height);
        if (correct) {
            resultMask = getMedianFilteredImageData(ctx, resultMask, width, height, 4);
        }
        /*
        const back_div = compoundImageData(ctx, multiply, back_a, alphaMaskCol, width, height);
        const subRtoback = compoundImageData(ctx, subtraction, card_a, back_div, width, height);
        const division_color = compoundImageData(ctx, division, subRtoback, division_btoc, width, height);
        const division_color_gray = getGrayImageDataMin(ctx, division_color,width, height);*/
        const result = getMaskedImageData(ctx, card_a, resultMask, width, height);
        return result;
    }
    const getCardSizeMaskedImageData = function (ctx, imageData, w, h, r) {
        let color = "#FFFFFF";
        const mask = getLeagueCardMask(ctx, w, h, 0, 0, w, h, r, color);
        const masked = getMaskedImageData(ctx, imageData, mask, w, h);
        return masked;
    }


    const getColor = (color, imageData, width, height, colorCode) => {
        let result = [0, 0, 0];
        if (!/^#[0-9a-fA-F]{6}$/.test(colorCode)) {
            return result;
        }
        result = [colorCode.substr(1, 2), colorCode.substr(3, 2), colorCode.substr(5, 2)];
        result = result.map(x => parseInt(x, 16));
        return result;
    }

    const getChromaKeyImageData = (ctx, imageData, color, width, height, colorCode, range = 50) => {
        const definedColor = getColor(color, imageData, width, height, colorCode);
        const chromakeyMask = getColorSelectiveMask(ctx, imageData, width, height, definedColor, range);
        const maskInv = getInversedImageData(ctx, chromakeyMask, width, height);
        const result = getMaskedImageData(ctx, imageData, maskInv, width, height);
        return result;
    }

    const getDoublemakeyImageData = (ctx, imageData_first, imageData_second, color_first, color_second, width, height) => {

    }

    //////////////////////////////////////////////////////////////////////////////

    const button_upload = document.getElementById("button_upload");
    const frame_previews = document.getElementById("previews");
    const radio_mode = document.getElementsByName("mode");
    const frame_results = document.getElementById("results");
    const checkbox_clip = document.getElementById("clip");
    const select_color = document.getElementById("color");
    const select_doublecolor_first = document.getElementById("color_first");
    const select_doublecolor_second = document.getElementById("color_second");
    const text_color_manual = document.getElementById("color_manual");
    const text_doublecolor_manual_first = document.getElementById("color_first_manual");
    const text_doublecolor_manual_second = document.getElementById("color_second_manual");
    const range_color_manual = document.getElementById("color_manual_range");

    let dragSrc;
    let dragDst;

    const onFileSelected = function (files) {
        for (let fileData of files) {
            if (!fileData.type.match('image.*')) {
                alert('画像を選択してください');
                return;
            }
            const reader = new FileReader();
            reader.onload = function () {
                const img = document.createElement('img');
                img.src = reader.result;
                frame_previews.appendChild(img);
                img.addEventListener("click", function () {
                    this.remove();
                });
                img.addEventListener("dragenter", function () {
                    if (dragSrc) {
                        this.style = "border-left:solid 5px blue;";
                        dragDst = this;
                    }
                });
                img.addEventListener("dragleave", function () {
                    this.style = "";
                    if (dragDst == this) {
                        dragDst = null;
                    }
                });
                img.addEventListener("dragstart", function () {
                    dragSrc = this;
                });
                img.addEventListener("dragend", function () {
                    if (dragSrc && dragDst) {
                        dragSrc.parentNode.insertBefore(dragSrc, dragDst);
                        dragDst.style = "";
                    }
                    dragSrc = null;
                    dragDst = null;
                });
            }
            reader.readAsDataURL(fileData);
        }
    }

    button_upload.addEventListener('change', function (e) {
        e.preventDefault();
        onFileSelected(e.target.files);
    }, false);
    document.addEventListener("dragover", function (e) {
        e.preventDefault();
    });
    document.addEventListener("drop", function (e) {
        e.preventDefault();
        onFileSelected(e.dataTransfer.files);
    });

    let imageCount = 0;
    let imageDate;

    const onSubmit = function (e) {
        imageCount = 0;
        imageDate = new Date();
        let selected = "";
        const canvases = [];
        const images = Array.prototype.slice.call(frame_previews.children);
        for (let checked of radio_mode) {
            if (checked.checked) {
                selected = checked.value;
                break;
            }
        }

        frame_results.textContent = null;
        for (let image of images) {
            const width = image.naturalWidth;
            const height = image.naturalHeight;
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            let imageData = createImageData(ctx, image, width, height);

            let w = width; let h = height;
            if (checkbox_clip.checked) {
                let x = 268; let y = 40; w = 800; h = 960; let r = 19;
                const isRotomi = ((length) => {
                    return length < 20;
                })(Math.hypot(imageData.data[0] - 246, imageData.data[1] - 237, imageData.data[2] - 240));

                if (isRotomi) {
                    x = 40; y = 36; w = 800; h = 960; r = 19;
                }
                if (width == 1280) {
                    x = 179; y = 27; w = 533; h = 640; r = 14;
                    if (isRotomi) {
                        x = 27; y = 24; w = 533; h = 640; r = 13;
                    }
                }

                const trimedImageData = getTrimedImageData(ctx, imageData, width, height, x, y, w, h);
                imageData = getCardSizeMaskedImageData(ctx, trimedImageData, w, h, r);
            }

            canvas.width = w;
            canvas.height = h;

            canvases.push({
                ctx: ctx,
                imageData: imageData,
                canvas: canvas
            });
        }

        if (selected == "passthrough") {
            for (let canvas of canvases) {
                canvas.ctx.putImageData(canvas.imageData, 0, 0);
                frame_results.appendChild(canvas.canvas);
                addDownloadLink(frame_results, canvas.canvas);
            }
        }
        if (selected == "chromakey") {
            for (let canvas of canvases) {
                const color = select_color.value;
                const colorCode = text_color_manual.value;
                const result_chromakey = getChromaKeyImageData(canvas.ctx, canvas.imageData, color, canvas.canvas.width, canvas.canvas.height, colorCode, Number(range_color_manual.value));
                canvas.ctx.putImageData(result_chromakey, 0, 0);
                frame_results.appendChild(canvas.canvas);
                addDownloadLink(frame_results, canvas.canvas);
            }
        }
        if (selected == "doublemakey") {
            if (images.length < 2 || images.length % 2 != 0) {
                alert("画像の数が不正です");
                return;
            }
            if (!images.some(x => x.naturalWidth == images[0].naturalWidth)) {
                alert("サイズの異なる画像が含まれています");
                return;
            }
            frame_results.textContent = null;
            for (let i = 0; i + 1 < canvases.length; i += 2) {
                const canvas = canvases[i].canvas;
                const ctx = canvases[i].ctx;
                const imageData_first = canvases[i].imageData;
                const imageData_second = canvases[i + 1].imageData;
                const width = canvas.width;
                const height = canvas.height;
                const color_first = getColor(select_doublecolor_first.value, imageData_first, width, height);
                const color_second = getColor(select_doublecolor_second.value, imageData_second, width, height);
                const result_doublemakey = getDoublemakeyImageData(ctx, imageData_first, imageData_second, color_first, color_second, width, height);
                ctx.putImageData(result_doublemakey, 0, 0);
                frame_results.appendChild(canvas);
                addDownloadLink(frame_results, canvas);
            }
        }
    };
    document.getElementById("bash").addEventListener("click", onSubmit, false);

    const addDownloadLink = (parent, canvas) => {
        const toDD = function (num) {
            num += "";
            if (num.length === 1) {
                num = "0" + num;
            }
            return num;
        }
        const link_download = document.createElement("a");
        const button_download = document.createElement("button");
        button_download.textContent = "ダウンロード";
        let date = imageDate;
        let filename = "card_";
        filename += date.getFullYear() + "" + toDD(date.getMonth() + 1) + "" + toDD(date.getDate()) + "_" + toDD(date.getHours()) + "" + toDD(date.getMinutes()) + "" + toDD(date.getSeconds()) + "_" + imageCount + ".png";
        imageCount++;
        button_download.addEventListener("click", function () {
            if (canvas.msToBlob) {
                let blob = canvas.msToBlob();
                window.navigator.msSaveBlob(blob, filename);
            } else {
                link_download.href = canvas.toDataURL('image/png');
                link_download.download = filename;
                link_download.click();
            }
        });
        parent.appendChild(link_download);
        parent.appendChild(button_download);
    }
    select_color.addEventListener("change", function(e) {
        let color;
        switch (select_color.value) {
            case "auto":
                color = "#000000";
                break;
            case "white":
                color = "#EFF0EB";
                break;
            case "black":
                color = "#000000";
                break;
            case "blue":
                color = "#00A5E9";
                break;
            case "red":
                color = "#E7256B";
                break;
            case "yellow":
                color = "#F1DE18";
                break;
            case "green":
                color = "#00AC92";
                break;
        }
        text_color_manual.value = color;
    });
})();