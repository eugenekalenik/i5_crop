class ImageCropper {
  constructor() {
    this.ctx = null;
    this.image = null;
    this.click = false;
    this.downPointX = 0;
    this.downPointY = 0;
    this.lastPointX = 0;
    this.lastPointY = 0;
    this.hoverBoxSize = 5;
    this.cropedFile = null;
    this.resize = false;
    this.canvasBackgroundColor = "#FFFFFF";
  }

  init() {
    this.ctx = document.getElementById("panel").getContext("2d");
    const imageUploader = document.getElementById('imageLoader');
    this.initCanvas();
    document.getElementById("cropBttn").onclick = this.cropImage.bind(this);
  }

  initCanvas(image) {
    this.image = new Image();
    this.image.setAttribute('crossOrigin', 'anonymous'); // optional, it is needed only if your image is not avalible on same domain.
    this.image.src = "./images/image2.jpg";
    this.image.addEventListener('load', () => {
      this.ctx.canvas.width = this.image.width;
      this.ctx.canvas.height = this.image.height;
      this.reDrawCanvas();
      this.initEventsOnCanvas();
    });
  }

  /**
   * Initlize mousedown and mouseup event, third brother of this type of event, onmousemove, will be set little letter.
   *
   */
  initEventsOnCanvas() {
    this.ctx.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.ctx.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  /**
   * This event is bit tricky!
   * Normal task of this method is to pin point the starting point, from where we will  strat making the selectin box.
   * However, it work diffrently if user is hover over the resize boxes
   *
   */

  onMouseDown(e) {
    const loc = this.windowToCanvas(e.clientX, e.clientY);
    e.preventDefault();
    this.click = true;
    if (!this.resize) {
      this.ctx.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.downPointX = loc.x;
      this.downPointY = loc.y;
      this.lastPointX = loc.x;
      this.lastPointY = loc.y;
    }
  }

  /**
   * register normal movement, with click but no re-size.
   */
  onMouseMove(e) {
    e.preventDefault();
    if (this.click) {
      const loc = this.windowToCanvas(e.clientX, e.clientY);
      this.lastPointX = loc.x;
      this.lastPointY = loc.y;
      this.reDrawCanvas();
    }
  }

  onMouseUp(e) {
    e.preventDefault();
    this.ctx.canvas.addEventListener('mousemove', () => this.onImageResize());
    this.click = false;
  }

  reDrawCanvas() {
    this.clearCanvas();
    this.drawImage();
    this.drawSelRect();
    this.drawResizerBox();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = this.canvasBackgroundColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /**
   * Draw image on canvas.
   */
  drawImage() {
    this.ctx.drawImage(this.image, 0, 0);
  }

  /**
   * Draw selection box on canvas
   */
  drawSelRect() {
    this.ctx.lineWidth = 1;

    this.ctx.strokeStyle = '#000000';
    this.ctx.stroke();
    this.ctx.strokeRect(this.downPointX, this.downPointY, (this.lastPointX - this.downPointX), (this.lastPointY - this.downPointY));
    // this.ctx.arc(this.downPointX, this.downPointY, this.lastPointX - this.downPointX, 0, 2 * Math.PI, false);
  }

  /**
   * This method take care of resizeing the selection box.
   * It does so by looking on (click == true and hover on resize box == true)
   * if both are true, it adjust the resize.
   *
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  onImageResize(e) {
    const centerPointX = (this.lastPointX + this.downPointX) / 2;
    const centerPointY = (this.lastPointY + this.downPointY) / 2;
    const loc = this.windowToCanvas(e.clientX, e.clientY);
    this.ctx.fillStyle = '#FF0000';
    this.ctx.lineWidth = 1;
    if (this.isResizeBoxHover(loc, centerPointX, this.downPointY)) {
      if (this.click) {
        this.downPointY = loc.y;
        this.reDrawCanvas();
      }
    } else if (this.isResizeBoxHover(loc, this.lastPointX, centerPointY)) {
      if (this.click) {
        this.lastPointX = loc.x;
        this.reDrawCanvas();
      }
    } else if (this.isResizeBoxHover(loc, centerPointX, this.lastPointY)) {
      if (this.click) {
        this.lastPointY = loc.y;
        this.reDrawCanvas();
      }
    } else if (this.isResizeBoxHover(loc, this.downPointX, centerPointY)) {
      if (this.click) {
        this.downPointX = loc.x;
        this.reDrawCanvas();
      }
    } else {
      this.resize = false;
      this.reDrawCanvas();
    }
  }

  /**
   * Detect the mousehover on given axis
   */
  isResizeBoxHover(loc, xPoint, yPoint) {
    const hoverMargin = 3;
    if (loc.x > (xPoint - this.hoverBoxSize - hoverMargin) && loc.x < (xPoint + this.hoverBoxSize + hoverMargin) && loc.y > (yPoint - this.hoverBoxSize - hoverMargin) && loc.y < (yPoint + 5 + hoverMargin)) {
      this.ctx.fillRect(xPoint - this.hoverBoxSize, yPoint - this.hoverBoxSize, this.hoverBoxSize * 2, this.hoverBoxSize * 2);
      this.resize = true;
      return true;
    }
    return false;
  }

  /**
   * Draw 4 resize box of 10 x 10
   * @return {[type]} [description]
   */
  drawResizerBox() {
    const centerPointX = (this.lastPointX + this.downPointX) / 2;
    const centerPointY = (this.lastPointY + this.downPointY) / 2;
    this.ctx.fillStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(centerPointX - this.hoverBoxSize, this.downPointY - this.hoverBoxSize, this.hoverBoxSize * 2, this.hoverBoxSize * 2);
    this.ctx.fillRect(this.lastPointX - this.hoverBoxSize, centerPointY - this.hoverBoxSize, this.hoverBoxSize * 2, this.hoverBoxSize * 2);
    this.ctx.fillRect(centerPointX - this.hoverBoxSize, this.lastPointY - this.hoverBoxSize, this.hoverBoxSize * 2, this.hoverBoxSize * 2);
    this.ctx.fillRect(this.downPointX - this.hoverBoxSize, centerPointY - this.hoverBoxSize, this.hoverBoxSize * 2, this.hoverBoxSize * 2);
  }

  /**
   * Translate to HTML coardinates to Canvas coardinates.
   */
  windowToCanvas(x, y) {
    const canvas = this.ctx.canvas,
      bbox = canvas.getBoundingClientRect();
    return {
      x: x - bbox.left * (canvas.width / bbox.width),
      y: y - bbox.top * (canvas.height / bbox.height)
    };
  }

  /**
   * Get the canavs, remove cutout, create image elemnet on UI.
   * @return {[type]}
   */
  cropImage() {
    const tempCtx = document.createElement('canvas').getContext('2d');
    tempCtx.canvas.width = this.image.width;
    tempCtx.canvas.height = this.image.height;
    console.log(this.downPointX, this.downPointY, (this.lastPointX - this.downPointX), (this.lastPointY - this.downPointY));
    tempCtx.drawImage(this.image, this.downPointX, this.downPointY, (this.lastPointX - this.downPointX), (this.lastPointY - this.downPointY), 0, 0, (this.lastPointX - this.downPointX), (this.lastPointY - this.downPointY));
    const imageData = tempCtx.canvas.toDataURL();
    document.getElementById('croppedImage').src = imageData;
  }
}

new ImageCropper().init();